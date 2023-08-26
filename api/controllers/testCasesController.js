const TestCaseModel = require("../models/testCasesModel.js");
const QuestionModel = require("../models/questionModel.js");

const createTestCase = async (req, res) => {
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

    const question = await QuestionModel.findById(req.body.question);
    question.testCases.push(testCase);
    await question.save();

    return res.status(201).json(testCase);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const deleteTestCase = async (req, res) => {
  try {
    await TestCaseModel.deleteOne({ _id: req.params.id });
    return res.status(201).json({ message: "Succesfully deleted test case" });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createTestCase,
  deleteTestCase,
};
