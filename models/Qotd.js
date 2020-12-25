const mongoose = require("mongoose");

const qotdSchema = mongoose.Schema({
	date: {
		type: Date,
		required: true,
	},
	question: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Qotd", qotdSchema);
