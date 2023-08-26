const {Schema,model} = require("mongoose");

const submission_schema = new Schema({
    user : {type:Number,required:true},
    language : {type:String,required:true},
    code : {type:String,required:true},
    pass : {type:Boolean,required:true,default:false},
    question_id : {type:Number}}, //this will act as an indicator to which question in the question DB shld be tested against the code
    {timestamps : true}
);

const submission_db = model("Submissions",submission_schema); 

module.exports = submission_db;