const express = require("express");

const Qotd = require("../models/Qotd");
const { auth } = require("./middleware")({});
const { getQuestionById, getQuestionBySerialNo } = require('../utils/qotd.utils');

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
	try {
		const { id, serial_no: serialNo } = req.query;

		let questionData;
		const { isAuthenticated } = req.headers;

		if (id && id !== "qotd") {
			// Fetch Question based on the id
			questionData = await getQuestionById(id);
			// var { key, data } = isAuthenticated ? { key: `${id}-auth`, data: questionData } : { key: id, data: questionData.question };
		} else if (serialNo) {
			questionData = await getQuestionBySerialNo(serialNo);
		} else {
			// Fetch Question of the day if id is not passed
			// this will get qPointer serial number's question
			questionData = await getQuestionBySerialNo();
		}

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
