const moment = require("moment");
const express = require("express");
const Qotd = require("../models/Qotd");
const config = require("../config");
const parser = require("./parser");
const redis = require("redis");
const router = express.Router();
const client = redis.createClient(config.redis);
const { cache, auth } = require("./middleware")(client);

/**
 * Get QOTD in HTML format
 * @returns {String} Html string.
 */
async function getQotd() {
	const today = moment().utc().format("YYYY/MM/DD");
	const questionData = await Qotd.findOne({ date: today });
	questionData.question = parser(questionData.question);
	return questionData;
}

/**
 * Gets Question In md format for an id
 * @param {String} id - Mongo Document
 * @returns {String} - Question md.
 */
async function getQuestionById(id) {
	const questionData = await Qotd.findById(id);
	questionData.question = parser(questionData.question);
	return questionData;
}

router.get("/", auth, cache, async (req, res) => {
	try {
		const { id } = req.query;
		let questionData;
		const todayEnd = new Date().setHours(23, 59, 59, 999);

		const { isAuthenticated } = req.headers;

		if (id) {
			// Fetch Question based on the id
			questionData = await getQuestionById(id);
			var { key, data } = isAuthenticated ? { key: `${id}-auth`, data: questionData } : { key: id, data: questionData.question };
		} else {
			// Fetch Question of the day if id is not passed
			questionData = await getQotd();
			var { key, data } = isAuthenticated ? { key: "qotd-auth", data: questionData } : { key: "qotd", data: questionData.question };
		}

		client.set(key, key.includes("auth") ? JSON.stringify(data) : data);
		client.expireat(key, parseInt(todayEnd / 1000));

		// Return the entire question mongo document if user is logged in.

		if (isAuthenticated) {
			return res.json(questionData);
		}
		// If no user logged in the return just the question.
		return res.send(questionData.question);
	} catch (error) {
		console.log(error.stack ? error.stack : error);
		return res.status(500).json({ message: error.message });
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
