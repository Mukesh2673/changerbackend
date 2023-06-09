const User = require('../models/user');
const { faker } = require('@faker-js/faker');
const utils = require("../libs/utils");

exports.run = async () => {

    const count = await User.countDocuments({}).exec();

    if (count === 0) {
        const users = Array.from(Array(10).keys()).map((index) => {
            return new User({
                username: faker.internet.userName(),
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                dob: faker.date.past({ years: utils.randomInt() }),
                uid: faker.string.uuid(),
                email: faker.internet.email(),
                profile_url: faker.image.url({
                    height: 200,
                    width: 200,
                }),
            });
        });

        await User.insertMany(users);
    }
}
