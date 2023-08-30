const {Schema,model, default: mongoose} = require("mongoose");

const score_schema = new Schema({
    user : {type:String,required:true},
    score : {type:Number,required:true,default:0},
    max : {type:Number,required:true}
    },
    {timestamps : true}
);

const scores_db = model("Scores",score_schema); 

module.exports = scores_db;