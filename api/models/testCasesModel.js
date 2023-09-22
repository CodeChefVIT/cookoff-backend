const mongoose = require("mongoose");

const TestCaseSchema = new mongoose.Schema({
  expectedOutput: { type: String, required: true },
  input: { type: String, required: true },
  hidden: { type: Boolean, default: false },
  time: { type: Number, default: 0, required: true },
  memory: { type: Number, default: 0, required: true },
  group: { type: Number, required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
});

const TestCaseModel = mongoose.model("Testcase", TestCaseSchema);

module.exports = TestCaseModel;
