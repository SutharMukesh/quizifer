const moment = require("moment");
const express = require("express");

const Qotd = require("../models/Qotd");
const { cache, auth } = require("./middleware")({});
const { getQuestionByDate, getQuestionById, getQuestionBySerialNo } = require('../utils/qotd.utils');

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
	try {
		const { id, date, serial_no: serialNo } = req.query;

		let questionData;
		// const todayEnd = new Date().setHours(23, 59, 59, 999);

		const { isAuthenticated } = req.headers;

		if (id && id !== "qotd") {
			// Fetch Question based on the id
			questionData = await getQuestionById(id);
			// var { key, data } = isAuthenticated ? { key: `${id}-auth`, data: questionData } : { key: id, data: questionData.question };
		} else if (date) {
			questionData = await getQuestionByDate(date);
		} else if (serialNo) {
			questionData = await getQuestionBySerialNo(serialNo);
		} else {
			// Fetch Question of the day if id is not passed
			const today = moment().utc().format("YYYY/MM/DD");
			questionData = await getQuestionByDate(today);
			// var { key, data } = isAuthenticated ? { key: "qotd-auth", data: questionData } : { key: "qotd", data: questionData.question };
		}

		// client.set(key, key.includes("auth") ? JSON.stringify(data) : data);
		// client.expireat(key, parseInt(todayEnd / 1000));

		// Return the entire question mongo document if user is logged in.

		if (isAuthenticated) {
			return res.json(questionData);
		}
		// If no user logged in the return just the question.
		return res.send(questionData.question);
	} catch (error) {
		next(error);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const question = new Qotd(req.body);
		await question.save();
		res.json({ message: "saved" });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
