const mongoose = require("mongoose");
const TestCaseModel = require("../models/testCasesModel");
const QuestionModel = require("../models/ques");

require("dotenv").config();

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connection Successfull"))
  .catch("Error connecting");

const insertTestCase = async (testCase) => {
  try {
    const question = await QuestionModel.findById(testCase.question);
    const inserted = await TestCaseModel.create(testCase);
    question.testCases.push(inserted._id);
    await question.save();
  } catch (error) {
    console.log(error.message);
  }
};

const testQuestions = [];

const addData = async (testQuestions) => {
  const questions = JSON.parse(JSON.stringify(testQuestions));
  questions.forEach((question) => (question.testCases = []));

  const insertedQuestions = await QuestionModel.insertMany(questions);
  const testCases = [];

  for (let i = 0; i < insertedQuestions.length; i++) {
    testQuestions[i].testCases.forEach(
      (tc) => (tc.question = insertedQuestions[i]._id),
    );
    testCases.push(...testQuestions[i].testCases);
    console.log(testQuestions[i].testCases);
  }

  for (let i = 0; i < testCases.length; i++) {
    await insertTestCase(testCases[i]);
  }
};

addData(testQuestions).then(() => console.log("Done"));
