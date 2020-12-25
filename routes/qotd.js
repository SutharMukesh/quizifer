const moment = require("moment");
const express = require("express");
const Qotd = require("../models/Qotd");
const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const today = moment().startOf("day").format();
		const question = await Qotd.find({ date: today });
		res.json(question);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post("/", async (req, res) => {
	try {
		const question = new Qotd(req.body);
		await question.save();
		res.json({ message: "saved" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
