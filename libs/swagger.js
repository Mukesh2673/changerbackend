const mongooseToSwagger = require('mongoose-to-swagger');
const swaggerJsdoc = require('swagger-jsdoc');

//add Models
const User = require('../models/user');
const Report = require('../models/report');
const Notification = require('../models/notification/index');
const Message = require('../models/message');
const Campaign = require('../models/campaign/campaign');
const CampaignParticipant = require('../models/campaign/campaignParticipation');
const BookMarks = require("../models/bookmarks")
const userSchema = mongooseToSwagger(User);
const reportSchema = mongooseToSwagger(Report);
const notificationSchema = mongooseToSwagger(Notification);
const messageSchema = mongooseToSwagger(Message);
const campaignSchema = mongooseToSwagger(Campaign);
const campaignParticipantSchema = mongooseToSwagger(CampaignParticipant);
const bookmarksSchema = mongooseToSwagger(BookMarks);

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: 'Changer 2',
        version: '1.0.0',
        description: 'API documentation for the Changer app'
      },
      host: 'localhost:3001',
      basePath: '/api',
      components: {
        schemas: {
          User: userSchema, 
          Report: reportSchema, 
          Notification: notificationSchema, 
          Message: messageSchema, 
          Campaign: campaignSchema, 
          CampaignParticipant: campaignParticipantSchema, 
          BookMarks: bookmarksSchema
        },
      },
    },
    apis: ['./routes/*.js'] 
  };
const swaggerDocs = swaggerJsdoc(swaggerOptions);
module.exports= {swaggerDocs}