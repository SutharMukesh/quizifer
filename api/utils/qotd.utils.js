const Qotd = require("../models/Qotd");
const parser = require("./parser");
const { getQPointer } = require("./qpointer.utils");

/**
 * Gets Question In md format for an id
 * @param {String} id - Mongo Document
 * @returns {String} - Question md.
 */
async function getQuestionById(id) {
    let questionData = await Qotd.findById(id);
    if (!questionData) {
        throw new Error('no question found!');
    }
    questionData = questionData.toJSON()

    questionData.question = parser(questionData.question);

    const qPointer = await getQPointer();
    questionData.todays_serial_no = qPointer.serial_no;

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
    const qPointer = await getQPointer();
    if (!serialNo) {
        serialNo = qPointer.serial_no;
    }

    serialNo = Number(serialNo);

    const qotdTotalCount = await Qotd.countDocuments();

    const rotatedSerialNo = rotateNumbers(serialNo, qotdTotalCount);

    let questionData = await Qotd.findOne({ serial_no: rotatedSerialNo });
    if (!questionData) {
        throw new Error('no question found!');
    }
    questionData = questionData.toJSON()

    questionData.question = parser(questionData.question);
    questionData.serial_no = serialNo;
    questionData.todays_serial_no = qPointer.serial_no;
    return questionData;
}

const getQotdTotalCount = async () => {
    const totalCount = await Qotd.count();
    return totalCount;
}

module.exports = {
    getQuestionById,
    rotateNumbers,
    getQuestionBySerialNo,
    getQotdTotalCount
}