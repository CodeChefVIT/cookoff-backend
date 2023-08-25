const mongoose = require('mongoose')
//const testCases=require("/TestCase");

const TestCaseSchema = new mongoose.Schema({
  expectedOutput: { type: String, required: true },
  input: { type: String, required: true },
  number: { type: Number, required: true },
  hidden: { type: Boolean, default: false },
  time: { type: Number, default: 0 },
  memory: { type: Number, default: 0 },
  explanation: { type: String },
  //question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" }
  question: {type: String}
});

const quesSchema = new mongoose.Schema({
  //id: false,
  question: {type: String, required: true, unique: true },
  //id: {type: Number, required: true },
  inputFormat: [{ type: String }],
  outputFormat: [{ type: String }],
  constraints: [{type: String, required: true,},],
  sampleTestInput: {type: String, required: true},
  sampleTestOutput: {type: String, required: true},
  timeLimit: {type: String, required: true},
  sourceLimit: {type: String, required: true},
  round: {type: Number, required: true},
  testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: "TestCaseSchema" }],
});

module.exports = mongoose.model("Question", quesSchema)   