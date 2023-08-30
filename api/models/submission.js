const {Schema,model, default: mongoose} = require("mongoose");

const submission_schema = new Schema({
    user : {type:String,required:true},
    language_id : {type:Number,required:true},
    code : {type:String,required:true},
    max_score : {type:Number},
    question_id : {type:mongoose.Schema.Types.ObjectId, ref : "Questions", required: true},
    score : {type: Number}},
    {timestamps : true}
);

const submission_db = model("Submissions",submission_schema); 

module.exports = submission_db;