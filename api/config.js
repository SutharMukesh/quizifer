require("dotenv").config({path:`${__dirname}/.env`});

const config = {
	environment: process.env.NODE_ENV || "dev",
	server: {
		port: process.env.PORT || 8080,
	},
	mongo: {
		url: process.env.MONGO_DB_URI || "mongodb://localhost/quizifer",
	},
};

module.exports = config;
