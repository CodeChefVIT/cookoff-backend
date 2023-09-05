const ques = require("../models/ques");

async function getQuestionByID(req, res) {
  try {
    var questions;
    const decoded=req.user
    
    if(decoded.userRole=='admin'){
        questions = await ques.findById(req.body.id).populate("testCases");
     }
    else{ 
      questions = await ques.findById(req.body.id).populate({path: 'testCases', match: {hidden: false}});
    }
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
    var questionsAll;
    const decoded=req.user;
    if(decoded.userRole=='admin'){
      questionsAll = await ques.find().populate("testCases");
    }
    else{
    questionsAll = await ques.find().populate({path: 'testCases', match: {hidden: false}});
    }
    if(questionsAll.length==0){
        return res.status(404).json({
        message: "No questions found",
      })
    }
    else{
       return res.status(201).json(questionsAll);
   }
}
 catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getByRound(req, res) {
  try {
    var questionByRound;
    const decoded=req.user;
    if(decoded.userRole=='admin'){
      questionByRound = await ques.where("round").equals(req.body.round).populate("testCases");
    }
    else{
      questionByRound = await ques.where("round").equals(req.body.round).populate({path: 'testCases', match: {hidden: false}});
    
    }
    
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
  try {
    const Ques = await ques.create({
      name: req.body.name,
      inputFormat: req.body.inputFormat,
      outputFormat: req.body.outputFormat,
      constraints: req.body.constraints,
      round: req.body.round,
      sampleTestInput: req.body.sampleTestInput,
      sampleTestOutput: req.body.sampleTestOutput,
      explanation: req.body.explanation,
      objective: req.body.objective,
      testCases: [],
    });
    await Ques.save();

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