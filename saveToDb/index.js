const { MongoClient } = require("mongodb");
const fs = require("fs");
const config = require("../config");
const path = require("path");
const moment = require("moment");
const axios = require("axios");
// Replace the uri string with your MongoDB deployment's connection string.

const client = new MongoClient(config.mongo.url, { useNewUrlParser: true, useUnifiedTopology: true });

function getQuestionsFromMd(seperator) {
	let mdFile = fs.readFileSync(path.join(__dirname, `./resources/js.md`), { encoding: "utf8", flag: "r" });
	let date = moment().startOf("day");
	return mdFile.split(seperator).map((question) => {
		let newDate = date.format("YYYY/MM/DD");
		date.add(1, "days");
		return { date: newDate, question };
	});
}

async function run() {
	try {
		await client.connect();
		const database = client.db("quizifer");
		const collection = database.collection("qotds");

		const questions = getQuestionsFromMd("---");
		await Promise.all(
			questions.map(async (question) => {
				await axios.post("http://127.0.0.1:8888/qotd", question);
			})
		);
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
}
run().catch(console.dir);