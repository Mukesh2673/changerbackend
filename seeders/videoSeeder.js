const { Video, Campaign, User } = require("../models");
const { faker } = require("@faker-js/faker");
const utils = require("../libs/utils");
const { getFrom } = require("../libs/utils");
const { VideoType } = require("../constants");

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const container = process.env.AZURE_VIDEO_CONTAINER;

const encodingIds = [
  "74bc169d-70bb-4166-a95e-031c39a590d1",
  "c12b82b0-f9f8-414b-8421-42cdc852c214",
  "cc60ebaa-7674-40cb-b9e4-5790138c5a95",
  "513f7829-51c3-449e-8952-559d22973a5a",
  "94fb8b04-42ea-4876-ba59-43316d1da734",
];

exports.run = async () => {
  console.log("Running: Video Seeder");
  const count = await Video.countDocuments({}).exec();

  if (count === 0) {
    const users = await User.find().limit(10).exec();
    const campaigns = await Campaign.find().limit(5).exec();

    const videos = Array.from(Array(100).keys()).map((index) => {
      const video_id = `video${getFrom(
          Array.from(Array(6).keys()).map((index) => index + 1)
      )}.mp4`;

      const thumbnail_id = `preview${getFrom(
          Array.from(Array(4).keys()).map((index) => index + 1)
      )}.png`;

      const video_url = `https://${storageAccountName}.blob.core.windows.net/${container}/${video_id}`;
      const thumbnail_url = `https://${storageAccountName}.blob.core.windows.net/${container}/${thumbnail_id}`;

      return new Video({
        user: utils.getFrom(users),
        campaign: utils.getFrom(campaigns),
        description: faker.lorem.paragraphs({ min: 1, max: 3 }),
        likes: [],
        video_url: video_url,
        video_id: video_id,
        thumbnail_url: thumbnail_url,
        encoding_id: getFrom(encodingIds),
        encoding_status: "FINISHED",
        type: VideoType.IMPACT,
      });
    });

    await Video.insertMany(videos);
  }
};
