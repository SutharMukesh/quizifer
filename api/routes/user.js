const express = require("express");
const User = require("../models/User");
const config = require("../config");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Strategy } = require("passport-github");

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

router.get("/auth/github", passport.authenticate("github"));

router.get("/auth/github/callback", passport.authenticate("github"), (req, res) => {
	res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
});

router.get("/me", async (req, res) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		console.error("Auth Header Missing");
		return res.send({ user: null });
	}
	const token = authHeader.split(" ")[1];
	if (!token) {
		console.error("Token not found in auth header");
		return res.send({ user: null });
	}

	let userId = "";
	try {
		const payload = await jwt.verify(token, process.env.JWT_SECRET);
		userId = payload.userId;
	} catch (error) {
		console.error(error);
		return res.send({ user: null });
	}
	
	const user = await User.findById(userId);
	return res.send({ user });
});

module.exports = router;
