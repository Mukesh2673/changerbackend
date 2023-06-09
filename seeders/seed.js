require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const userSeeder = require('./userSeeder');
const campaignSeeder = require("./campaignSeeder");

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
    await userSeeder.run();
    await campaignSeeder.run();
};

module.exports = app;
