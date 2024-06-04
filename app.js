require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const createError = require("http-errors");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const mongooseToSwagger = require('mongoose-to-swagger');

const app = express();
const apiRoutes = require("./routes/api");
const { ws } = require("./libs/webSocket");

const User = require('./models/user');
const Report = require('./models/report');
const Notification = require('./models/notification/index');
const Message = require('./models/message');
const Campaign = require('./models/campaign/campaign');
const CampaignParticipant = require('./models/campaign/campaignParticipant');

const userSchema = mongooseToSwagger(User);
const reportSchema = mongooseToSwagger(Report);
const notificationSchema = mongooseToSwagger(Notification);
const messageSchema = mongooseToSwagger(Message);
const campaignSchema = mongooseToSwagger(Campaign);
const campaignParticipantSchema = mongooseToSwagger(CampaignParticipant);

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
      },
    },
  },
  apis: ['./routes/*.js'] 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT = process.env.PORT || 3001;
ws.on('connection', function connection(ws) {
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));
app.use(cors());
app.options("*", cors());

app.use(require("./middleware/firebaseAuth").decodeToken);

app.use('/api', apiRoutes);

const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString, {
  useUnifiedTopology: true,
});
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});

//adding web socket Configuration

module.exports = app;
