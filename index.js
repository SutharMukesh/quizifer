const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const morgan = require("morgan");

require("./database");
const config = require("./config");
const qotd = require("./routes/qotd");

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use("/qotd", qotd);

app.listen(config.server.port, () => {
	console.log(`Quizifer listens on port ${config.server.port}`);
});

module.exports = app;
