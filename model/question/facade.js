const Facade = require('../../lib/facade')
const questionSchema = require('./schema')

class QuestionFacade extends Facade {}

module.exports = new QuestionFacade('Question', questionSchema)
