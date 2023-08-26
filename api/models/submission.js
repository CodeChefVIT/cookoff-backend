const {Schema,model} = require("mongoose");

const submission_schema = new Schema({
    id : {type:Number},
    user : {type:Number,required:true},
    language : {type:String,required:true},
    code : {type:String,required:true},
    pass : {type:Boolean, default:false},
    timestamp : {type:Date},
    question_id : {type:Number} //this will act as an indicator to which question in the question DB shld be tested against the code
});

const submission_db = model("Submissions",submission_schema); 

module.exports = submission_db;