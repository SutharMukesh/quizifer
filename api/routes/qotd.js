const moment = require("moment");
const express = require("express");
const Qotd = require("../models/Qotd");
const config = require("../config");
const parser = require("./parser");
const router = express.Router();
const redis = require("redis");

const client = redis.createClient(config.redis);

const cache = function (req, res, next) {
	client.get("qotd", (err, data) => {
		if (err) throw error;
		if (data) {
			console.log(`Serving todays question from cache.`);
			res.send(data);
		} else {
			next();
		}
	});
};

router.get("/", cache, async (req, res) => {
	try {
		const today = moment().utc().format("YYYY/MM/DD");
		const questionData = await Qotd.findOne({ date: today });
		const html = parser(questionData.question, req.query);

		const todayEnd = new Date().setHours(23, 59, 59, 999);
		client.set("qotd", html);
		client.expireat("qotd", parseInt(todayEnd / 1000));

		res.send(html);
	} catch (error) {
		console.log(error.stack ? error.stack : error);
		res.status(500).json({ message: error.message });
	}
});

router.post("/", async (req, res) => {
	try {
		const question = new Qotd(req.body);
		await question.save();
		res.json({ message: "saved" });
	} catch (error) {
		console.log(error.stack ? error.stack : error);
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
