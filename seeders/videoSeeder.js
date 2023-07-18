const { Video, Campaign, User } = require('../models');
const { faker } = require('@faker-js/faker');
const utils = require("../libs/utils");
const {getFrom} = require("../libs/utils");

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const container = process.env.AZURE_VIDEO_CONTAINER;

const encodingIds = [
    '1c9428e7-5552-4266-aa98-ce6d57986120',
    '13d5ccd5-5566-4d72-86b0-de6febc52186',
    '4d0e36ca-dfa7-4f54-aea4-727d6dffe950',
    '31b71686-7e84-4d50-8c7e-f8b73e83bda2',
    '99803eca-70eb-41a9-81ba-4641cf13b25d',
]

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
                likes: [],
                video_url: video_url,
                video_id: video_id,
                encoding_id: getFrom(encodingIds),
                encoding_status: 'FINISHED'
            });
        });

        await Video.insertMany(videos);
    }
}
