const serverless = require("serverless-http");
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const { Strategy } = require("passport-github");
const jwt = require("jsonwebtoken");

const config = require("./config");
const qotd = require("./routes/qotd");
const User = require("./models/User");
require("./database");

const app = express();
app.use(helmet());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("tiny"));

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

app.get("/auth/github", passport.authenticate("github"));

app.get("/auth/github/callback", passport.authenticate("github"), (req, res) => {
	res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
});

app.get("/me", async (req, res) => {
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

app.use("/qotd", qotd);

module.exports.handler = serverless(app);
