const serverless = require("serverless-http");
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const qotd = require("./routes/qotd");
require("./database");

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use("/qotd", qotd);

module.exports.handler = serverless(app);
