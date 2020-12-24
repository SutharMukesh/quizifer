const Router = require("express").Router;
const router = new Router();

const question = require("./model/question/router");

router.route("/").get((req, res) => {
	res.json({ message: "Welcome to quizifer-api API!" });
});

router.use("/question", question);

module.exports = router;
