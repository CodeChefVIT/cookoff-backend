const mongoose = require("mongoose");


const quesSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  objective: { type: String, required: true },
  inputFormat: [{ type: String }],
  outputFormat: [{ type: String }],
  constraints: [{ type: String, required: true }],
  round: { type: Number, required: true },
  sampleTestInput: [{ type: String, required: true }],
  sampleTestOutput: [{ type: String, required: true }],
  explanation: [{type: String}],
  points: {type: Number},
  testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Testcase" }],
});

module.exports = mongoose.model("Question", quesSchema);
