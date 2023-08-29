const submission_db = require("../models/submission.js");
const questiondb = require("../models/ques.js");
const testdb = require("../models/testCasesModel.js");
const axios = require("axios");

class submission{
    async create(req,res,results,score){
        const {user,language_id,code,question_id} = req.body;
        if(!user || !language_id || !code || !question_id){
            res.send("Some elements are missing from the request body");
            return;
        }
        const check = await submission_db.findOne({user : user , question_id : question_id});
        if(check){
            await submission_db.updateOne({user : user, question_id : question_id},{code : code,language_id : language_id,pass : results,score : score});
            res.send("Data updated");
        }
        else{
            await submission_db.create({user : user, language_id : language_id, code : code, question_id : question_id,pass : results,score : score})
            .then(() => console.log("Data has been entered into the DB")).catch(err => console.log(err));
            res.sendStatus(201);
        }
    }

    async getdata(req,res){
        const {question_id,code,language_id} = req.body;
        const testcase = await questiondb.findById(question_id,'testCases');
        const testcases = testcase.testCases;
        var results = [];
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
            console.log(data_sent_to_judge0);
            await axios.post('http://139.59.4.43:2358/submissions/?base64_encoded=false&wait=true',data_sent_to_judge0,{
                headers: {
                  'Content-Type': 'application/json'
                }})
            .then(function(response){
                console.log(response);
                //console.log(atob(response.data.compile_output.replace("\n", "")));
                const data = response.data;
                if(data.status.id == 3){
                    results.push(true);
                }
                else{
                    results.push(false);
                }
            });
            console.log(results);
        }
        const score = (value, index) => {
            return value.filter((x) => x == index).length;
        };
        this.create(req,res,results,score(results,true));
    }

    async totalscore(req,res){

    }
}

module.exports = submission;