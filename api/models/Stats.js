const mongoose = require("mongoose");

const qotdSchema = mongoose.Schema({
	date: {
		type: String,
		required: true,
		unique: true,
	},
	notified: {
		type: Number,
		required: true
	},
	attempted: {
		type: Number,
		required: true
	},
	ignored: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model("Stats", qotdSchema);