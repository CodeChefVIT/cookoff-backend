const mongoose=require('mongoose')
const ques= require("./ques")
const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const port=3000;
mongoose.connect("mongodb://127.0.0.1/QuestionsTesting");

app.use(bodyParser.urlencoded({extended: true}));
//getQuestionByID(1);
app.post("/get",(req,res)=>{
    console.log("post");
    getAll(req,res);
})

app.post("/add",(req,res)=>{
    createQuestion(req,res);
})

app.post("/getOne",(req,res)=>{
    getQuestionByID(req,res);
})

app.post("/getRound",(req,res)=>{
  getByRound(req,res);
})

async function getQuestionByID(req,res){
    try{
        const questions=await ques.where("id").equals(req.body.id);
        console.log(questions);
    }
    catch (error) {
        return res.status(500).json({
          message: "Something went wrong",
        });
      }
}

async function getAll(req,res){
    try{
        const questionsAll=await ques.find();
        console.log(questionsAll);
        //res.status(200).send("Status Working");
        return res.status(201).send({
        message: "Questions Fetched",
          });
    }
    catch (error) {
        return res.status(500).json({
          message: "Something went wrong",
        });
      }
}

async function getByRound(req,res){
  try{
    const questionByRound= await ques.where("round").equals(req.body.round);
    console.log(questionByRound);
  }
  catch(error){
    return res.status(500).json({
      message: error.message,
    })
  }
}

async function createQuestion(req, res) {   //admin only
    try {
    //console.log(req.body);
      const Ques = await ques.create({
        question: req.body.question,
        id: req.body.id,
        inputFormat: req.body.inputFormat,
        outputformat: req.body.outputFormat,
        constraints: req.body.constraints,
        sampleTestInput: req.body.sampleTestInput,
        sampleTestOutput: req.body.sampleTestOutput,
        timeLimit: req.body.timeLimit,
        sourceLimit: req.body.sourceLimit,
        round: req.body.round,
        // question: "This is NOT the question",
        // id: 2,
        // inputFormat: "String",
        // outputFormat: "String",
        // constrains: ["less than two","more than 0"],
        // sampleTestInput: "tihs",
        // sampleTestOutput: "Tihs",
        // timeLimit: "2min",
        // sourceLimit: "None",
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

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
