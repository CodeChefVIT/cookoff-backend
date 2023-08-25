const ques = require("./ques");

async function getQuestionByID(req, res) {
  try {
    const questions = await ques
      .where("id")
      .equals(req.body.id)
      .populate("testCases");
    console.log(questions);
    return res.status(201).json(questions);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const questionsAll = await ques.find().populate("testCases");

    console.log(questionsAll);

    return res.status(201).json(questionsAll);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function getByRound(req, res) {
  try {
    const questionByRound = await ques
      .where("round")
      .equals(req.body.round)
      .populate("testCases");
    console.log(questionByRound);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function createQuestion(req, res) {
  //admin only
  try {
    const Ques = await ques.create({
      name: req.body.name,
      id: req.body.id,
      inputFormat: req.body.inputFormat,
      outputformat: req.body.outputFormat,
      constraints: req.body.constraints,
      sampleTestInput: req.body.sampleTestInput,
      sampleTestOutput: req.body.sampleTestOutput,
      timeLimit: req.body.timeLimit,
      sourceLimit: req.body.sourceLimit,
      round: req.body.round,
      objective: req.body.objective,
      testCases: [],
    });
    await Ques.save();

    console.log(Ques);
    return res.status(201).json(Ques);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  createQuestion,
  getAll,
  getByRound,
  getQuestionByID,
};
