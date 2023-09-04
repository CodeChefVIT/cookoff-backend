const TestCaseModel = require("../models/testCasesModel.js");
const QuestionModel = require("../models/ques.js");

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
    if (!question.testCases.includes(testCase)) {
      question.testCases.push(testCase);
    }
    await question.save();

    return res.status(201).json({ message: "Inserted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to insert test case",
    });
  }
};

const deleteTestCase = async (req, res) => {
  try {
    const testCase = await TestCaseModel.findByIdAndDelete(req.params.id);
    const question = await QuestionModel.findById(testCase.question);
    if (question) {
      question.testCases.pull(testCase._id);
      await question.save();
    }
    return res.status(201).json({ message: "Succesfully deleted test case" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete test case",
    });
  }
};

const updateTestCase = async (req, res) => {
  try {
    const testCase = await TestCaseModel.findById(req.params.id);
    const { expectedOutput, input, number, hidden, time, memory, explanation, question } = req.body;

    testCase.expectedOutput = expectedOutput ? expectedOutput : testCase.expectedOutput;
    testCase.input = input ? input : testCase.input;
    testCase.hidden = hidden ? hidden : testCase.hidden;
    testCase.number = number ? number : testCase.number;
    testCase.time = time ? time : testCase.time;
    testCase.memory = memory ? memory : testCase.memory;
    testCase.explanation = explanation ? explanation : testCase.explanation;

    if (question) {
      const oldQuestion = await QuestionModel.findById(testCase.question);
      if (oldQuestion) {
        oldQuestion.testCases.pull(testCase._id);
        await oldQuestion.save();
      }

      const updated = await QuestionModel.findById(question);
      console.log(updated);
      updated.testCases.push(testCase._id);
      await updated.save();

      testCase.question = question;
    }

    await testCase.save();

    return res.status(201).json({ testCase });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update test case" });
  }
}

module.exports = {
  createTestCase,
  deleteTestCase,
  updateTestCase
};
