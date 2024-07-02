const mongooseToSwagger = require('mongoose-to-swagger');
const swaggerJsdoc = require('swagger-jsdoc');

//add Models
const User = require('../models/user');
const Report = require('../models/report');
const Notification = require('../models/notification/index');
const Message = require('../models/message');
const Campaign = require('../models/campaign/campaign');
const CampaignVolunteering = require('../models/campaign/campaignVolunteering');
const BookMarks = require("../models/bookmarks")
const Video = require("../models/video")
const Issue = require("../models/issue/issue")
const Skill = require("../models/skills/skill")

const IssueSchema=mongooseToSwagger(Issue);
const userSchema = mongooseToSwagger(User);
const reportSchema = mongooseToSwagger(Report);
const notificationSchema = mongooseToSwagger(Notification);
const messageSchema = mongooseToSwagger(Message);
const campaignSchema = mongooseToSwagger(Campaign);
const CampaignVolunteeringSchema = mongooseToSwagger(CampaignVolunteering);
const bookmarksSchema = mongooseToSwagger(BookMarks);
const videosSchema = mongooseToSwagger(Video);
const skillSchema = mongooseToSwagger(Skill);

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
          CampaignVolunteering: CampaignVolunteeringSchema, 
          BookMarks: bookmarksSchema,
          Video: videosSchema,
          Issue:IssueSchema,
          Skill:skillSchema,
        },
      },
    },
    apis: ['./routes/swaggerRoutes/*.js'] 
  };
const swaggerDocs = swaggerJsdoc(swaggerOptions);
module.exports= {swaggerDocs}