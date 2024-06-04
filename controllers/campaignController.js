const {
  Campaign,
  CampaignParticipant,
  User,
  Impact,
  Video,
  donation,
  petitions,
  campaignPhases,
} = require("../models");
const mongoose = require("mongoose");
const { generateTags } = require("../controllers/hashtagController");
const { endorseCampaign } = require("../libs/campaign");
const { saveAlgolia } = require("../libs/algolia");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.campaignRecords = async (query) => {
  let records = await Campaign.find(query).populate([
    {
      path: "phases",
      populate: [
        { path: "donation", model: donation },
        { path: "petition", model: petitions },
        { path: "participation", model: CampaignParticipant },
      ],
    },
    {
      path: "videos",
      populate: { path: "videos", model: Video },
    },
    {
      path: "impacts",
      populate: { path: "impacts", model: Impact },
    },
  ]);
  return records;
};

exports.index = async (req, res, next) => {
  try {
    let campaignData = await this.campaignRecords({});
    return res.json({
      status: 200,
      data: campaignData,
      success: true,
    });
  } catch (error) {
    console.log("err irs", error);
    return res.json({ status: 400, data: [], success: false, message: error });
  }
};

exports.show = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!!campaign) {
      return res.json(campaign);
    }

    return res.status(404).json({ message: "Campaign not found." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = req.body;
    const tags = await generateTags(data.title);
    if (!mongoose.Types.ObjectId.isValid(data.user)) {
      return res.status(400).json({
        status: 400,
        error: "Invalid User ID format",
        success: false,
      });
    }
    const auth = await User.findById({ _id: data.user });
    if (!auth) {
      return res.json({
        status: 401,
        message: "invalid User",
        success: false,
      });
    }
    const campaign = new Campaign({
      user: data.user,
      cause: data.cause,
      title: data.title,
      story: data.story,
      image: data.image,
    });
    const campaigns = await campaign.save();
    let campaignTag = campaigns?.hashtags;
    var tagsArray = [];
    if (campaignTag?.length > 0) {
      let arr = [...campaignTag, ...tags];
      tagsArray = arr.filter(
        (value, index, self) => self.indexOf(value) === index
      );
    } else {
      tagsArray = tags;
    }

    const campaignsId = campaigns._id;
    const videos = new Video({
      user: req.body.user,
      campaign: campaignsId,
      description: req.body.campaignStory,
      title: req.body.title,
      video_url: req.body.video.videoUrl,
      type: req.body.video.type,
      thumbnail_url: req.body.thumbnailUrl,
    });
    const savedVideo = await videos.save();
    const videoId = savedVideo._id;
    const phaseArr = data.phase;
    const savePhaseId = [];
    const videRecords = await Video.find({ _id: videoId });
    await saveAlgolia(videRecords, "videos");
    for (let i = 0; i < phaseArr.length; i++) {
      const phaseItem = new campaignPhases({
        title: phaseArr[i].title,
        campaign: campaignsId,
      });
      const savePhaseItem = await phaseItem.save();
      savePhaseId[i] = savePhaseItem._id;
      const Action = req.body.phase[i].action;
      const donationCount = Action.filter((item) => item?.name == "donation");
      if (donationCount.length > 1) {
        return res.json({
          status: 400,
          message: "duplicate donation not allow",
        });
      }

      donationCount[0].phaseId = savePhaseId[i];
      const petitionData = Action.filter((item) => item?.name == "petition");
      if (petitionData.length > 1) {
        return res.json({
          status: 400,
          message: "duplicate petition not allow",
        });
      }

      petitionData[0].phaseId = savePhaseId[i];
      const participation = Action.filter(
        (item) => item?.name == "participation"
      );
      const participantionsId = [];
      const location = [];
      for (let j = 0; j < participation.length; j++) {
        participation[j].phaseId = savePhaseId[i];
        const participant = new CampaignParticipant(participation[j]);
        const savedParticipant = await participant.save();
        let id = savedParticipant._id;
        let geoLocation = {
          lat: parseFloat(savedParticipant.location.coordinates[0]),
          lng: parseFloat(savedParticipant.location.coordinates[1]),
        };
        location.push(geoLocation);
        participantionsId.push(id);
      }
      const donations = new donation(donationCount[0]);
      const savedDonation = await donations.save();
      const DonationId = savedDonation._id;
      const petition = new petitions(petitionData[0]);
      const savedPetitions = await petition.save();
      const petitionId = savedPetitions._id;
      await campaignPhases.findByIdAndUpdate(
        { _id: savePhaseId[i] },
        {
          $set: {
            donation: DonationId,
            petition: petitionId,
            participation: participantionsId,
          },
        },
        { new: true }
      );
      await Campaign.findByIdAndUpdate(
        { _id: campaignsId },
        {
          $set: {
            phases: savePhaseId,
            hashtags: tagsArray,
            video: videoId,
            _geoloc: location,
          },
        }
      );
    }
    let records = await this.campaignRecords({ _id: campaignsId });
    await saveAlgolia(records, "campaigns");
    return res.json({
      status: 200,
      message: "Campaign added successfully!",
      success: true,
      data: records,
    });
  } catch (err) {
    console.log("erro is", err);
    return res.json({ status: 500, message: err, success: false });
  }
};

exports.update = async (req, res, next) => {};

exports.delete = async (req, res, next) => {};

exports.donate = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  var stripeToken = req.body.token;
  var charge = stripe.charges.create(
    {
      amount: parseInt(req.body.amount * 100),
      currency: "usd",
      card: stripeToken,
      description: req.body.description,
    },
    async function (err, charge) {
      if (err && err.type === "StripeCardError") {
        return res.status(401).json({ message: "Card error" });
      }
      //TODO : Store purchase in DB for future reference

      if (campaign) {
        await Campaign.updateOne(
          { _id: campaign._id },
          {
            donated_amount: campaign.donated_amount + req.body.amount,
          }
        );
        await endorseCampaign(req.user, campaign._id);
      }

      return res.status(200).json({ message: "Success" });
    }
  );
};

exports.paymentSession = async (req, res) => {
  try {
    const amount = req.body.amount * 100;
    const successUrl = req.body.successUrl;
    const cancelUrl = req.body.cancelUrl;
    const name = req.body.name;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: name,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.donateToCampaign = async (req, res) => {
  var stripeToken = req.body.stripeToken;
  const amount = req.body.amount;
  try {
    var charge = await stripe.charges.create({
      amount: parseInt(amount * 100),
      currency: "usd",
      card: stripeToken.id,
      description: req.body.description,
    });
    if (charge)
      return res
        .status(200)
        .json({ message: "Success", amount: amount, data: charge });
  } catch (err) {
    console.log("errr is", err);
    res.status(400).json({ message: "fail", error: err });
  }
};
exports.participant = async (req, res) => {
  try {
    const user = req.user;
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    let participation = await CampaignParticipant.findOne({
      campaign: campaign._id,
      user: user._id,
    }).exec();
    if (participation) {
      return res
        .status(422)
        .json({ message: "You are already participating in this campaign." });
    }

    participation = new CampaignParticipant({
      user,
      campaign,
    });

    await Campaign.updateOne(
      { _id: campaign._id },
      {
        volunteers: campaign.volunteers + 1,
      }
    ).exec();

    const saved = await participation.save();
    await endorseCampaign(user, campaign._id);

    return res.status(200).json(saved);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
