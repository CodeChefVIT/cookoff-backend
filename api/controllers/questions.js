const ques = require("../models/ques");

async function getQuestionByID(req, res) {
  try {
    const questions = await ques.findById(req.body.id).populate("testCases");
    console.log(questions);
    if(questions.length==0){
      return res.status(404).json({
        message: "No questions found",
      })
    }
    else{
      return res.status(201).json(questions);
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const questionsAll = await ques.find().populate("testCases");

    if(questionsAll.length==0){
      return res.status(404).json({
        message: "No questions found",
      })
    }
    else{
      return res.status(201).json(questionsAll);
    }
} catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getByRound(req, res) {
  try {
    const questionByRound = await ques.where("round").equals(req.body.round).populate("testCases");
    console.log(questionByRound);
    if(questionByRound.length==0){
      return res.status(404).json({
        message: "No questions found",
      })
    }
    else{
      return res.status(201).json(questionByRound);
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function deleteQuestion(req,res){
  try{
    const deletedItem = await ques.findByIdAndDelete(req.params.id);
    console.log(req.body.id)
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(201).json({
      message: "Successfully Deleted"
    })
  }
  catch (error){
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function updateQuestion(req,res){
  try {
    const updatedData = await ques.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body, 
      },
      { new: true } 
    );

    if (!updatedData) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.status(200).json(updatedData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

async function createQuestion(req, res) {
  //admin only
  try {
    const Ques = await ques.create({
      name: req.body.name,
      id: req.body.id,
      inputFormat: req.body.inputFormat,
      outputFormat: req.body.outputFormat,
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
  updateQuestion,
  deleteQuestion
};
