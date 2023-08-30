const submission_db = require("../models/submission.js");
const questiondb = require("../models/ques.js");
const testdb = require("../models/testCasesModel.js");
const axios = require("axios");
const scores_db = require("../models/score.js");

class submission{
    async create(req,res,score,max){
        const {user,language_id,code,question_id} = req.body;
        if(!user || !language_id || !code || !question_id){
            res.send("Some elements are missing from the request body");
            return;
        }
        const check = await submission_db.findOne({user : user , question_id : question_id});
        if(check){
            await submission_db.updateOne({user : user, question_id : question_id},{code : code,language_id : language_id,score : score,max_score :max});
            res.send("Data updated");
        }
        else{
            await submission_db.create({user : user, language_id : language_id, code : code, question_id : question_id,score : score,max_score : max})
            .then(() => console.log("Data has been entered into the DB")).catch(err => console.log(err));
            res.sendStatus(201);
        }
    }

    async getdata(req,res){
        const {question_id,code,language_id} = req.body;
        const testcase = await questiondb.findById(question_id,'testCases');
        const testcases = testcase.testCases;
        var tests = [];
        for(let i in testcases){
            const current = await testdb.findById(testcases[i]);
            tests.push({
                source_code : btoa(code),
                language_id : language_id,
                stdin : btoa(current.input),
                expected_output : btoa(current.expectedOutput),
                cpu_time_limit : current.time,
                memory_limit : current.memory,
            })
        }
        console.log(tests);

        const tokens = await axios.post("http://139.59.4.43:2358/submissions/batch?base64_encoded=true",
            {
                "submissions" : tests
            },
            {
                header : {
                    'Content-Type' : "application/JSON"
                }
            }).then(response => response.data)
        console.log(tokens);        
        let str = [];
        tokens.forEach(element => {
            str.push(element.token);
        });
        console.log(str);
        const url = "http://139.59.4.43:2358/submissions/batch?tokens="+str.toString()+"&base64_encoded=false&fields=status_id,stdout,stderr";
        console.log(url);
        let completion = false;
        while(!completion){
            let score = 0;
            let msg = "No errors";
            completion = true;
            const result = await axios.get(url).then(response => response.data.submissions);
            result.forEach(element => {
                switch(element.status_id){
                    case 1:
                    case 2:
                        completion = false;
                        break;
                    case 3:
                        score += 1;
                        break;
                    case 5:
                        msg = "Time limit exceeded";
                        break;
                    case 6:
                        msg = "Complilation error";
                        break;
                    case 13:
                        msg = "Server side error";
                        break;
                    default:
                        msg = "Runtime error";
                        console.log(element.status_id);
                        break;
                }
            })
            console.log(score,msg);
            if(completion){
                this.create(req,res,score,result.length);
                this.totalscore(req,score,result.length);
            }
        }
    }

    async totalscore(req,score,max){
        const {user} = req.body;
        await scores_db.updateOne({user:user},{score:score , max:max},{upsert : true});
    }
}

module.exports = submission;