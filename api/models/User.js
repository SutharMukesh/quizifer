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
		type: [{ _id: mongoose.Types.ObjectId, caption: String }],
		unique: true,
	},
});

module.exports = mongoose.model("User", userSchema);
