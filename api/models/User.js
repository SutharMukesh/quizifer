const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	githubId: {
		type: String,
		required: true,
		unique: true,
	},
	bookmarks: {
		type: [String],
		unique: true,
	},
	upvotes: {
		type: [String],
		unique: true,
	},
});

module.exports = mongoose.model("User", userSchema);
