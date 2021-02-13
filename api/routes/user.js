const express = require("express");
const User = require("../models/User");
const config = require("../config");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Strategy } = require("passport-github");
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();
const { auth } = require("./middleware")();

passport.use(
	new Strategy(
		{
			clientID: config.GITHUB_CLIENT_ID,
			clientSecret: config.GITHUB_CLIENT_SECRET,
			callbackURL: "http://localhost:3000/dev/auth/github/callback",
		},
		async (_accessToken, _refreshToken, profile, cb) => {
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

router.get("/auth/github", passport.authenticate("github"));

router.get("/auth/github/callback", passport.authenticate("github"), (req, res) => {
	res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
});

router.get("/me", auth, async (req, res) => {
	if (req.headers.isAuthenticated) {
		const user = await User.findById(req.headers.tokenPayload.userId);
		return res.send(user);
	}
	return res.status(500).send({ user: null });
});

router.put("/bookmarks/:bookmark", auth, async (req, res) => {
	if (req.headers.isAuthenticated) {
		const { bookmark } = req.params;
		if (!bookmark) {
			return res.status(500).send({ message: "No bookmark passed to add" });
		}
		const user = await User.findById(req.headers.tokenPayload.userId);
		// check for upsert
		let upsert = false;
		const caption = req.body.caption || "Missing caption!";
		user.bookmarks = user.bookmarks.map((bookmarkObj) => {
			if (bookmarkObj._id.toString() === bookmark) {
				upsert = true;
				bookmarkObj.caption = caption;
			}
			return bookmarkObj;
		});
		if (!upsert) {
			user.bookmarks.push({ _id: ObjectId(bookmark), caption });
		}

		await user.save();
		return res.send({ message: "bookmark added" });
	}
	return res.status(500).send({ user: null });
});

router.delete("/bookmarks/:bookmark", auth, async (req, res) => {
	if (req.headers.isAuthenticated) {
		const { bookmark } = req.params;
		if (!bookmark) {
			return res.status(500).send({ message: "No bookmark passed to delete" });
		}
		await User.updateOne(
			{
				_id: ObjectId(req.headers.tokenPayload.userId),
			},
			{
				$pull: {
					bookmarks: { _id: ObjectId(bookmark) },
				},
			}
		);
		return res.send({ message: "bookmark deleted" });
	}
	return res.status(500).send({ user: null });
});

module.exports = router;
