const submission_db = require("D:/attempted JS/cookoff-backend/schema/submission.js");
const questiondb = require("D:/attempted JS/cookoff-backend/schema/question.js");
const testdb = require("d:/attempted JS/cookoff-backend/schema/testcase.js");

class submission{
    async create(req,res){
        const {id,user,language,code,question_id} = req.body;
        await submission_db.create({id : id, user : user, language : language, code : code, question_id : question_id})
        .then(() => console.log("Data has been entered into the DB"));
    }

    async getdata(req,res){
        const {question_id,code,language_id} = req.body;
        const test = await questiondb.findOne({id : parseInt(question_id)},'testcase');
        const testcase = test.testcase;
        for(let i = 0;i<testcase.length;i++){
            const current = await testdb.findOne({id : testcase[i]});
            const data_sent_to_judge0 = {
                source_code : code,
                language_id : language_id,
                stdin : current.input,
                expected_output : current.output,
                cpu_time_limit : current.timelimit,
                memory_limit : current.memory,
            }
            //now this data_sent_to_judge0 can be sent to the get submission route of judge0 API and that will return a token
            //it can then use the given token to post the submission to see the results
            console.log(data_sent_to_judge0);
        }
    }
}

module.exports = submission;