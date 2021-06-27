const QPointer = require("../models/QPointer");

const getQPointer = async () => {
    const qPointer = await QPointer.find();
    return qPointer[0];
};

const setQPointer = async (qPointer) => {
    console.log({ qPointer })
    const qPointerModel = new QPointer(qPointer);
    qPointer = await qPointerModel.save();
    return qPointer;
};

module.exports = {
    getQPointer,
    setQPointer
}