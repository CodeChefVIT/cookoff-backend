const mongoose = require("mongoose");
const TestCaseModel = require("../models/testCasesModel");
const QuestionModel = require("../models/ques");
require("dotenv").config();
console.log(process.env.DB_URI);

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connection Successfull"))
  .catch("Error connecting");

const testQuestions = [
  {
    name: "Smart Phone",
    objective: `You are developing a smartphone app. You have a list of potential customers for your app. Each customer has a budget and will buy the app at your declared price if and only if the price is less than or equal to the customer's budget.


        You want to fix a price so that the revenue you earn from the app is maximized. Find this maximum possible revenue.
        
        
        For instance, suppose you have 4 potential customers and their budgets are 30, 20, 53 and 14. In this case, the maximum revenue you can get is 60 .`,
    inputFormat: [
      "Line 1 : N, the total number of potential customers.",
      "Lines 2 to N+1: Each line has the budget of a potential customer.",
    ],
    outputFormat: [
      `The output consists of a single integer, the maximum possible revenue you can earn from selling your app
        `,
    ],
    sampleTestInput: `4
        30
        20
        53
        14`,
    sampleTestOutput: "60",
    timeLimit: "2",
    sourceLimit: "100",
    round: 1,
    testCases: [
      {
        expectedOutput: "60",
        input: `4
                30
                20
                53
                14`,
        number: 1,
        hidden: false,
        time: 1,
        memory: 20,
        explanation: "None",
      },
      {
        expectedOutput: "99",
        input: `5
                40
                3
                65
                33
                21`,
        number: 2,
        hidden: true,
        time: 0.5,
        memory: 10,
        explanation: "None",
      },
    ],
  },
];

const testCases = [];

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

const addData = async () => {
  let questions = JSON.parse(JSON.stringify(testQuestions));
  questions.forEach((question) => (question.testCases = []));

  await QuestionModel.deleteMany({});
  await TestCaseModel.deleteMany({});
  const insertedQuestions = await QuestionModel.insertMany(questions);

  for (let i = 0; i < insertedQuestions.length; i++) {
    testQuestions[i].testCases.forEach(
      (tc) => (tc.question = insertedQuestions[i]._id)
    );
    testCases.push(...testQuestions[i].testCases);
    console.log(testQuestions[i].testCases);
  }

  for (let i = 0; i < testCases.length; i++) {
    await insertTestCase(testCases[i]);
  }
};

addData().then(() => console.log("Done"));
