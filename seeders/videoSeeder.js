const { Video, Campaign, User } = require('../models');
const { faker } = require('@faker-js/faker');
const utils = require("../libs/utils");
const {getFrom} = require("../libs/utils");

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const container = process.env.AZURE_VIDEO_CONTAINER;

exports.run = async () => {

    console.log('Running: Video Seeder');
    const count = await Video.countDocuments({}).exec();

    if (count === 0) {
        const users = await User.find().limit(10).exec();
        const campaigns = await Campaign.find().limit(5).exec();

        const videos = Array.from(Array(100).keys()).map((index) => {
            const video_id = `video${getFrom(Array.from(Array(6).keys()).map((index) => index + 1))}.mp4`;

            const video_url = `https://${storageAccountName}.blob.core.windows.net/${container}/${video_id}`;

            return new Video({
                user: utils.getFrom(users),
                campaign: utils.getFrom(campaigns),
                description: faker.lorem.paragraphs({min: 1, max: 3}),
                likes: faker.finance.amount({ min: 100, max: 1000000}),
                video_url: video_url,
                video_id: video_id,
            });
        });

        await Video.insertMany(videos);
    }
}
