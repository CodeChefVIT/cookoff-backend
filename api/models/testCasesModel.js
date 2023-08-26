const mongoose = require("mongoose");

const TestCaseSchema = new mongoose.Schema({
  expectedOutput: { type: String, required: true },
  input: { type: String, required: true },
  number: { type: Number, required: true },
  hidden: { type: Boolean, default: false },
  time: { type: Number, default: 0 },
  memory: { type: Number, default: 0 },
  explanation: { type: String },
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
});

const TestCaseModel = mongoose.model("Testcase", TestCaseSchema);

module.exports = TestCaseModel;
