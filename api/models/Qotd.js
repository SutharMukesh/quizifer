const mongoose = require("mongoose");

const qotdSchema = mongoose.Schema({
	date: {
		type: String,
		required: true,
		unique: true,
	},
	question: {
		type: String,
		required: true,
		unique: true,
	},
	title: {
		type: String,
	},
	serial_no: {
		type: Number,
		unique: true,
		required: true
	}
});

module.exports = mongoose.model("Qotd", qotdSchema);
