const { Campaign, CampaignParticipant, User, Video} = require('../models');
const {endorseCampaign} = require("../libs/campaign");
const {ObjectId} = require("mongodb");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.index = async (req, res, next) => {
    try {
        const { page = 1, user, cause, endorsedBy } = req.query;

        const query = {};

        if (!!user) {
            query['user'] = user
        }

        if (!!cause) {
            query['cause'] = cause
        }

        if (!!endorsedBy) {
            const endorsingUser = await User.findById(endorsedBy).exec();
            if (endorsingUser && endorsingUser.endorsed_campaigns) {
                query["_id"] = { $in: endorsingUser.endorsed_campaigns };
            }
        }

        const result = await Campaign.paginate(query, {
            page,
            sort: { createdAt: 'desc' }
        });

        return res.json(result);
    } catch (error) {
        return res.json([]);
    }
}

exports.show = async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!!campaign) {
            return res.json(campaign);
        }

        return res.status(404).json({message: "Campaign not found."});
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

exports.create = async (req, res, next) => {
try{
    let phase={
        



    }






    console.log("hiiii",req.body.phase[0].action)
    return res.json([]);
}
catch(err){
    console.log("hiiii")

}
}

exports.update = async (req, res, next) => {

}

exports.delete = async (req, res, next) => {

}

exports.donate = async (req, res) => {
    const campaign = await Campaign.findById(req.params.id);

    var stripeToken = req.body.token;
    var charge = stripe.charges.create({
        amount: parseInt(req.body.amount * 100),
        currency: "usd",
        card: stripeToken,
        description: req.body.description
    }, async function (err, charge) {
        if (err && err.type === 'StripeCardError') {
            return res.status(401).json({message: "Card error"});
        }
        //TODO : Store purchase in DB for future reference

        if (campaign) {
            await Campaign.updateOne({_id: campaign._id}, {
                donated_amount: campaign.donated_amount + req.body.amount
            });
            await endorseCampaign(req.user, campaign._id);
        }

        return res.status(200).json({message: "Success"});
    });
}

exports.participant = async (req, res) => {
    try {
        const user = req.user;
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({message: "Campaign not found."});
        }

        let participation = await CampaignParticipant.findOne({campaign: campaign._id, user: user._id}).exec();
        if (participation) {
            return res.status(422).json({message: "You are already participating in this campaign."});
        }

        participation = new CampaignParticipant({
            user, campaign
        });

        await Campaign.updateOne({_id: campaign._id}, {
            volunteers: campaign.volunteers + 1
        }).exec();

        const saved = await participation.save();
        await endorseCampaign(user, campaign._id);

        return res.status(200).json(saved);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}
