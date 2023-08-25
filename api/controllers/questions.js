const mongoose=require('mongoose')
const ques= require("./ques")
const express=require("express");
const bodyParser=require("body-parser");
const testCases=require("./TestCase");

const app=express();
const port=3000;
mongoose.connect("mongodb://127.0.0.1/QuestionsTesting");

//console.log(testCases.id);
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
      //var Ques;
      // const testCase= await testCases.create({
      //   expectedOutput: req.body.expectedOutput,
      //   input: req.body.input,
      //   number: req.body.number,
      //   hidden: req.body.hidden,
      //   time: req.body.time,
      //   memory: req.body.memory,
      //   explanation: req.body.explanation,
      //   question: req.body.question,

      // });
      // var arr=[];
      // for(var i=0;i<testCases.length;i++){
      //   if (testCases[i].question==req.body.question){
      //     arr.push(testCases[i].id);
      //   }
      // }
      // console.log(arr);
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
        //testCases: arr,
      });
      await Ques.save();
      //await testCase.save();
      //console.log(testCase);
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
