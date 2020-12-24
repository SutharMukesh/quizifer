const Controller = require('../../lib/controller')
const questionFacade = require('./facade')

class QuestionController extends Controller {}

module.exports = new QuestionController(questionFacade)
