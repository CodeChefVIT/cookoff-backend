import {schema} from mongoose

const submission_schema = schema({
    language : {type:String, required:true},
    code : {type:String, required:true},
    question_id : {type:Number,required:true},
    //test_cases : {type:[<document name>.test_cases]} //In future it can call the questions databases for the test cases that has to be tested and store it as an array of objects
});


