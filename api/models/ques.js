const mongoose = require("mongoose");


const quesSchema = new mongoose.Schema({
  //id: false,
  question: { type: String, required: true, unique: true },
  //id: {type: Number, required: true },
  inputFormat: [{ type: String }],
  outputFormat: [{ type: String }],
  constraints: [{ type: String, required: true }],
  sampleTestInput: { type: String, required: true },
  sampleTestOutput: { type: String, required: true },
  timeLimit: { type: String, required: true },
  sourceLimit: { type: String, required: true },
  round: { type: Number, required: true },
  testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: "TestCaseSchema" }],
});

module.exports = mongoose.model("Question", quesSchema);
