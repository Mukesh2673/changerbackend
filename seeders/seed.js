require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const userSeeder = require('./userSeeder');
const campaignSeeder = require("./campaignSeeder");
const videoSeeder = require("./videoSeeder");

const mongoString = process.env.DATABASE_URL

mongoose.connect(mongoString)
    .then(() => {
      console.log('Database Connected');

        seedDB().then(() => {
            mongoose.connection.close();
            console.log('DB Connection closed');
        });

    })
    .catch((error) => {
      console.log(error)
    });


const seedDB = async () => {
    console.log('Seeding database.')
    await userSeeder.run(); // create normal users
    await userSeeder.run(true); // create premium users
    await campaignSeeder.run();
    await videoSeeder.run();
};

module.exports = app;
