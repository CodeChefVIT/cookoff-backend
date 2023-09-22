const mongoose = require("mongoose");
const TestCaseModel = require("../models/testCasesModel");
const QuestionModel = require("../models/ques");
const fs = require("fs");

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

const addData = async (Questions) => {
  const questions = JSON.parse(JSON.stringify(Questions));
  questions.forEach((question) => (question.testCases = []));

  await TestCaseModel.deleteMany({});
  await QuestionModel.deleteMany({});

  const insertedQuestions = await QuestionModel.insertMany(questions);
  const testCases = [];

  for (let i = 0; i < insertedQuestions.length; i++) {
    Questions[i].testCases.forEach((
      tc,
    ) => (tc.question = insertedQuestions[i]._id));
    testCases.push(...Questions[i].testCases);
  }

  for (let i = 0; i < testCases.length; i++) {
    await insertTestCase(testCases[i]);
  }
};

fs.readFile("final_seeder.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error: ", err);
    return;
  }

  try {
    mongoose
      // .connect("mongodb://localhost:27017/mydb")
      .connect(
        "mongodb+srv://doadmin:18EA0xKN3IC7259W@db-mongodb-blr1-51446-2eb2b2b3.mongo.ondigitalocean.com/admin?tls=true&authSource=admin&replicaSet=db-mongodb-blr1-51446",
      )
      .then(() => console.log("Connection Successfull"))
      .then(() => addData(JSON.parse(data)))
      .then(() => console.log("Done"))
      .catch("Error connecting");
  } catch (parseError) {
    console.error(parseError.message);
  }
});
