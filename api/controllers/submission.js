const submission_db = require("../models/submission.js");
const questiondb = require("../models/ques.js");
const testdb = require("../models/testCasesModel.js");

class submission{
    
    async create(req,res){
        const {user,language,code,question_id} = req.body;
        if(!user || !language || !code || !question_id){
            res.send("Some elements are missing from the request body");
            return;
        }
        const check = await submission_db.findOne({user : user , question_id : question_id});
        if(check){
            await submission_db.updateOne({user : user, question_id : question_id},{code : code,language : language});
            res.send("Data updated");
        }
        else{
            await submission_db.create({user : user, language : language, code : code, question_id : question_id})
            .then(() => console.log("Data has been entered into the DB")).catch(err => console.log(err));
            res.sendStatus(201);
        }
    }

    async getdata(req,res){
        const {question_id,code,language_id} = req.body;
        const testcase = await questiondb.findById(question_id,'testCases');
        const testcases = testcase.testCases;
        for(let i = 0;i<testcases.length;i++){
            const current = await testdb.findById(testcases[i]);
            const data_sent_to_judge0 = {
                source_code : code,
                language_id : language_id,
                stdin : current.input,
                expected_output : current.expectedOutput,
                cpu_time_limit : current.time,
                memory_limit : current.memory,
            }
            //now this data_sent_to_judge0 can be sent to the get submission route of judge0 API and that will return a token
            //it can then use the given token to post the submission to see the results
            console.log(data_sent_to_judge0);
        }
        res.sendStatus(200);//in near future need to add the score to a score schema so status will turn to 201 and hence request is a post
        //need to test this function call
    }
}

module.exports = submission;