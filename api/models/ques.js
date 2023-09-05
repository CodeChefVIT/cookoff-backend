const mongoose = require("mongoose");


const quesSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  objective: { type: String, required: true },
  inputFormat: [{ type: String }],
  outputFormat: [{ type: String }],
  constraints: [{ type: String, required: true }],
  round: { type: Number, required: true },
  testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Testcase" }],
});

module.exports = mongoose.model("Question", quesSchema);
