const mongoose = require("mongoose");

/**
 * This collection will only have one document, 
 * which will have serial_no, and date
 * such that qotd, will fetch the question based on the serial number pointed in this collection.
 */
const qPointerSchema = mongoose.Schema({
	date: {
		type: String,
		required: true,
		unique: true,
	},
	serial_no: {
		type: Number,
		unique: true,
		required: true
	}
});

module.exports = mongoose.model("QPointer", qPointerSchema);
