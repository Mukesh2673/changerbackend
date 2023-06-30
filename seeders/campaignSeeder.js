const { Campaign, User } = require('../models');
const { faker } = require('@faker-js/faker');
const utils = require("../libs/utils");
const {CAUSES} = require("../constants");

exports.run = async () => {

    console.log('Running: Campaign Seeder');
    const count = await Campaign.countDocuments({}).exec();

    if (count === 0) {
        const users = await User.find().limit(10).exec();
        const causes = CAUSES;

        const campaigns = Array.from(Array(100).keys()).map((index) => {
            return new Campaign({
                user: utils.getFrom(users),
                cause: utils.getFrom(causes).slug,
                title: faker.lorem.text(),
                slug: faker.lorem.slug(),
                description: faker.lorem.paragraphs({min: 1, max: 3}),
                support_amount: faker.finance.amount({ min: 10000, max: 100000}),
                support_volunteers: 100 * faker.number.int({ min: 1, max: 5 })
            });
        });

        await Campaign.insertMany(campaigns);
    }
}
