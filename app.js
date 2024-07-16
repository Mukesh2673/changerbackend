require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const runSeeders = require('./seeders');
runSeeders();
const apiRoutes = require("./routes/api");
const { ws } = require("./libs/webSocket");
const {swaggerDocs} = require('./libs/swagger')
const swaggerUi = require('swagger-ui-express');
const { I18n } = require('i18n')
const i18n= new I18n({
  locales: ['english', 'arabic', 'french',  'chinese'],
  directory: path.join(__dirname, 'translation'),
  defaultLocale: 'english'
})
app.use(i18n.init);

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
//app.use(require("./middleware/firebaseAuth").decodeToken);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
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
