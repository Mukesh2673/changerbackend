require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
const mongoose = require("mongoose");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var app = express();
const apiRoutes = require("./routes/api");
const cors = require("cors");
const {ws}=require("./libs/webSocket")
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

app.use("/api", apiRoutes);

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
