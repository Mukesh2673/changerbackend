const { Video, Campaign, User } = require('../models');
const { faker } = require('@faker-js/faker');
const utils = require("../libs/utils");
const {getFrom} = require("../libs/utils");

exports.run = async () => {

    console.log('Running: Video Seeder');
    const count = await Video.countDocuments({}).exec();

    if (count === 0) {
        const users = await User.find().limit(10).exec();
        const campaigns = await Campaign.find().limit(5).exec();

        const videos = Array.from(Array(200).keys()).map((index) => {
            const video_id = getFrom(Array.from(Array(5).keys()).map((index) => index + 1));

            return new Video({
                user: utils.getFrom(users),
                campaign: utils.getFrom(campaigns),
                description: faker.lorem.paragraphs({min: 1, max: 3}),
                likes: faker.finance.amount({ min: 100, max: 1000000}),
                video_url: `/videos/video${video_id}.mp4`,
                video_id: `${video_id}.mp4`,
            });
        });

        await Video.insertMany(videos);
    }
}
