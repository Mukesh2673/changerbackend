const { Campaign, User } = require('../models');
const { faker } = require('@faker-js/faker');
const utils = require("../libs/utils");
const {CAUSES} = require("../constants");

exports.run = async () => {

    console.log('Running: Campaign Seeder');
    //const count = await Campaign.countDocuments({}).exec();
    const existingUser = await User.findOne({username: 'changer'});
    if (existingUser) {
        console.log('User already exists');
        return;
    }

    const user = await user.save(new User({
        username: 'changer',
        first_name: 'The',
        last_name: 'Changer',
        dob: faker.date.past({ years: utils.randomInt() }),
        uid: 'hpO8QMrEqcRiEEUi0FkBFS95v5s2',
        email: 'changer@thechanger.io',
        profile_url: faker.image.url({
            height: 200,
            width: 200,
        })
    }));

    const campaign = new Campaign({
        user: user,
        cause: utils.getFrom(CAUSES).slug,
        title: "Hello World",
        slug: 'hello-world',
        description: faker.lorem.paragraphs({min: 1, max: 3}),
        support_amount: 45000,
        support_volunteers: 1000
    });

    await campaign.save();
}
