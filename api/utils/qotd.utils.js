const Qotd = require("../models/Qotd");
const parser = require("./parser");

/**
 * Get QOTD in HTML format
 * @returns {String} Html string.
 */
async function getQuestionByDate(date) {
    const questionData = await Qotd.findOne({ date });
    questionData.question = parser(questionData.question);
    return questionData;
}

/**
 * Gets Question In md format for an id
 * @param {String} id - Mongo Document
 * @returns {String} - Question md.
 */
async function getQuestionById(id) {
    const questionData = await Qotd.findById(id);
    questionData.question = parser(questionData.question);
    return questionData;
}

/**
 * This function is not memory efficient, 
 * todo: tail call recursion.
 * @param {Number} number 
 * @param {Number} total 
 * @returns 
 */
const rotateNumbers = (number, total) => {
    if (number > 0 && number <= total) {
        return number;
    }

    if (number < 1) {
        number = number + total
    }

    if (number > total) {
        number = number - total
    }

    return rotateNumbers(number, total)
}

/**
 * Get QOTD in HTML format
 * @param {Number} serialNo 
 * @returns {String} Html string.
 */
async function getQuestionBySerialNo(serialNo) {
    if (!serialNo) {
        throw new Error('serialNo is required');
    }
    serialNo = Number(serialNo);

    const qotdTotalCount = await Qotd.count()

    serialNo = rotateNumbers(serialNo, qotdTotalCount);

    const questionData = await Qotd.findOne({ serial_no: serialNo });
    if (!questionData) {
        throw new Error('no question found!');
    }

    questionData.question = parser(questionData.question);
    return questionData;
}

const getQotdTotalCount = async () => {
    const totalCount = await Qotd.count();
    return totalCount;
}

module.exports = {
    getQuestionByDate,
    getQuestionById,
    rotateNumbers,
    getQuestionBySerialNo,
    getQotdTotalCount
}