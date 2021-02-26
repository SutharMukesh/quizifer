const serverless = require("serverless-http");
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require('cors');
const qotd = require("./routes/qotd");
const stats = require("./routes/stats");
require("./database");

const app = express();
app.use(helmet());
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use("/qotd", qotd);
app.use("/stats", stats);

// app.listen(config.server.port, () => {
// 	console.log(`Quizifer listens on port ${config.server.port}`);
// });

module.exports.handler = serverless(app);
