const express = require("express");
const User = require("../models/User");
const config = require("../config");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Strategy } = require("passport-github");
const mongoose = require("mongoose");
const router = express.Router();

passport.use(
	new Strategy(
		{
			clientID: config.GITHUB_CLIENT_ID,
			clientSecret: config.GITHUB_CLIENT_SECRET,
			callbackURL: "http://localhost:3000/dev/auth/github/callback",
		},
		async (_accessToken, _refreshToken, profile, cb) => {
			console.log(profile);

			let user = await User.findOne({ githubId: profile.id });
			if (user) {
				user.name = profile.displayName;
				user.save();
			} else {
				await User.create({ name: profile.displayName, githubId: profile.id });
			}
			cb(null, { accessToken: jwt.sign({ userId: user ? user.id : null }, config.JWT_SECRET, { expiresIn: "1y" }), refreshToken: "" });
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user.accessToken);
});

const validateAccessToken = async (authHeader) => {
	if (!authHeader) {
		console.error("Auth Header Missing");
		return false;
	}
	const token = authHeader.split(" ")[1];
	if (!token) {
		console.error("Token not found in auth header");
		return false;
	}

	try {
		const payload = await jwt.verify(token, process.env.JWT_SECRET);
		return payload;
	} catch (error) {
		console.error(error);
		return false;
	}
};

router.get("/auth/github", passport.authenticate("github"));

router.get("/auth/github/callback", passport.authenticate("github"), (req, res) => {
	res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
});

router.get("/me", async (req, res) => {
	const payload = await validateAccessToken(req.headers.authorization);
	if (payload) {
		const user = await User.aggregate([
			{
				$match: {
					_id: mongoose.Types.ObjectId(payload.userId),
				},
			},
			{
				$lookup: {
					from: "qotds",
					localField: "bookmarks",
					foreignField: "_id",
					as: "bookmarks",
				},
			},
			{ $project: { bookmarks: { question: 0 } } },
		]);
		return res.send(user[0]);
	}
	return res.status(500).send({ user: null });
});

router.put("/bookmarks/:bookmark", async (req, res) => {
	const payload = await validateAccessToken(req.headers.authorization);
	if (payload) {
		const { bookmark } = req.params;
		if (!bookmark) {
			return res.status(500).send({ message: "No bookmark passed to add" });
		}
		await User.findByIdAndUpdate(payload.userId, { $addToSet: { bookmarks: bookmark } });
		return res.send({ message: "bookmark added" });
	}
	return res.status(500).send({ user: null });
});

router.delete("/bookmarks/:bookmark", async (req, res) => {
	const payload = await validateAccessToken(req.headers.authorization);
	if (payload) {
		const { bookmark } = req.params;
		if (!bookmark) {
			return res.status(500).send({ message: "No bookmark passed to delete" });
		}
		await User.findByIdAndUpdate(payload.userId, { $pull: { bookmarks: bookmark } });
		return res.send({ message: "bookmark deleted" });
	}
	return res.status(500).send({ user: null });
});

module.exports = router;
