const moment = require("moment");
const express = require("express");
const Stats = require("../models/Stats");
const router = express.Router();

router.put("/:event", async (req, res, next) => {
	try {
		const allowEvents = { n: "notified", a: "attempted", i: "ignored" };
		if (allowEvents.hasOwnProperty(req.params.event)) {
			await Stats.updateOne({ date: moment().utc().format("YYYY/MM/DD") }, { $inc: { [allowEvents[req.params.event]]: 1 } }, { upsert: true });
			res.status(200).json({ message: "ACK" });
		} else {
			res.status(500).json({ message: "NACK - Invalid Event" });
		}
	} catch (error) {
		next(error);
	}
});

module.exports = router;
