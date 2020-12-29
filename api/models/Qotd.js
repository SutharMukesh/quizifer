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
});

module.exports = mongoose.model("Qotd", qotdSchema);
