const TestCaseModel = require("../models/testCasesModel.js");

async function createTestCases(req, res) {
  try {
    const testCase = await TestCaseModel.create({
      expectedOutput: req.body.expectedOutput,
      input: req.body.input,
      number: req.body.number,
      hidden: req.body.hidden,
      time: req.body.time,
      memory: req.body.memory,
      question: req.body.question,
    });
    result = await testCase.save();
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Error creating testcase",
    });
  }
}

module.exports = createTestCases;
