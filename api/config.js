require("dotenv").config({ path: `${__dirname}/.env` });

const config = {
	environment: process.env.NODE_ENV || "dev",
	server: {
		port: process.env.PORT || 8080,
	},
	mongo: {
		url: process.env.MONGO_DB_URI || "mongodb://localhost/quizifer",
	},
	redis: {
		port: process.env.REDIS_PORT || 6379,
		host: process.env.REDIS_HOST || "127.0.0.1",
	},
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
	JWT_SECRET: process.env.JWT_SECRET,
};

if (process.env.REDIS_PASS) {
	config.redis.password = process.env.REDIS_PASS;
}

module.exports = config;
