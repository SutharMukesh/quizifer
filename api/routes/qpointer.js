const moment = require("moment");
const express = require("express");

const { getQotdTotalCount } = require("../utils/qotd.utils");
const { getQPointer, setQPointer } = require("../utils/qpointer.utils");

const router = express.Router();

/**
 * Update Serial number of the day
 * this api should be called at the start of the date
 */
router.get("/", async (req, res, next) => {
	try {
		let date = moment().utc();
		const today = date.format("YYYY/MM/DD").toString();

		// get Question Pointer
		let qPointer = await getQPointer();
		const qotdTotalCount = await getQotdTotalCount();

		if (!qPointer) {
			// qPointer is empty, setting initial qPointer with todays date
			qPointer = await setQPointer({
				date: today,
				serial_no: 1,
				total_questions: qotdTotalCount
			});
		}

		// Don't increment the serial_no counter if this route is called again for a day
		if (today === qPointer.date) {
			return res.json(qPointer);
		}

		// update date and increment serial_no
		qPointer.date = today;
		qPointer.serial_no = qPointer.serial_no + 1

		// Reset serial_no pointer when it exceeds total qotd counts
		if (qPointer.serial_no > qotdTotalCount) {
			qPointer.serial_no = qPointer.serial_no - qotdTotalCount;
		}
		qPointer = await qPointer.save();

		return res.json(qPointer);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
