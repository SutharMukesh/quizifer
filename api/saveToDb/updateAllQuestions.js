require("../database");
const path = require("path");
const Qotd = require("../models/Qotd");
var MarkdownIt = require("markdown-it");
var md = new MarkdownIt();

async function run() {
    const questions = await Qotd.find();
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        question.serial_no = i + 1;
        // console.log({question})
        // var result = md.parse(question.question);
        // console.log(result[1].content);
        // question.title = result[1].content;
        const saveResult = await question.save();
        console.log(saveResult);
    }
    console.log("updated");
}
(async () => await run())();
