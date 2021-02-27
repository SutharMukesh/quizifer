const serverless = require("serverless-http");
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");

const stats = require("./routes/stats");
const qotd = require("./routes/qotd");
const user = require("./routes/user");
require("./database");

const app = express();
app.use(helmet());
app.use(cors());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("tiny"));

app.use("/qotd", qotd);
app.use("/stats", stats);
app.use(user)

module.exports.handler = serverless(app);
