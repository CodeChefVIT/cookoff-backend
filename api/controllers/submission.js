const submission_db = require("../models/submission.js");
const questiondb = require("../models/ques.js");
const testdb = require("../models/testCasesModel.js");
const axios = require("axios");
const scores_db = require("../models/score.js");
const ques = require("../models/ques.js");

class submission{
    async create(req,res,score,max){
        const {user,language_id,code,question_id} = req.body;
        const check = await submission_db.findOne({user : user , question_id : question_id});
        let error = "";
        if(check){
            error = await submission_db.updateOne({user : user, question_id : question_id},{code : code,language_id : language_id,score : score,max_score :max})
            .then(() => "")
            .catch(err => err.errors);
            return !error?"Updated exisiting record":error;
        }
        else{
            error = await submission_db.create({user : user, language_id : language_id, code : code, question_id : question_id,score : score,max_score : max})
            .then(() => "")
            .catch(err => err.errors);
            return !error?"Submission record has been saved":error;
        }
    }

    async getdata(req,res){
        const {user,question_id,code,language_id} = req.body;
        const check = await submission_db.findOne({user : user,question_id : question_id},"code");
        if(check && check.code == code){
            res.status(200).json({
                message : "No changes in source code"
            });
            return;
        }
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
        let msg = [];
        while(!completion){
            let score = 0;
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
                    case 4:
                        msg.push("Ouput received :- "+element.stdout);
                        break;
                    case 5:
                        msg.push("Time limit exceeded");
                        break;
                    case 6:
                        msg.push("Complilation error");
                        break;
                    case 13:
                        msg.push("Server side error");
                        break;
                    default:
                        msg.push("Runtime error");
                        console.log(element.status_id);
                        break;
                }
            })
            if(msg.includes("Complilation error")){
                res.status(200).json({
                    message : "There was a complilation error :- " + result.stderr[msg.indexOf("Complilation error")]
                })
            }
            else if(msg.includes("Server side error")){
                res.status(200).json({
                    message : "There was an issue connecting to the judge0"
                })
            }
            else if(msg.includes("Runtime error")){
                res.status(200).json({
                    message : "There was an runtime error"
                })
            }
            let index = "";
            for(let i in msg){
                if(i.substring("Output")){
                    index = msg[i];
                    break;
                }
            }
            msg = [index];
            if(completion){
                msg.push(await this.create(req,res,score,result.length));
                msg.push(await this.totalscore(req,score,result.length));
                this.update_totals(req);
                console.log(msg);
                res.status(201).json({
                    message : msg
                })
            }
        }
    }

    async totalscore(req,score,maxscore){
        const {user,question_id} = req.body;
        const exist = await scores_db.findOne({user : user});
        let error = "";
        if(!exist){
            error = await scores_db.create({user : user , score : [score] ,max : [maxscore], question_id : [question_id]}).catch(err => err.errors);
        }
        else{
            let maxscr = exist.max;
            let scr = exist.score;
            let quest = exist.question_id;
            if(quest.includes(question_id)){
                const index = quest.indexOf(question_id);
                scr[index] = score;
                maxscr[index] = maxscore;
            }
            else{
                scr.push(score);
                quest.push(question_id);
                console.log(quest);
                maxscr.push(maxscore);
            }
            error = await scores_db.updateOne({user : user},{score : scr, max : maxscr,question_id : quest},{upsert : true}).then(() => "").catch(err => err.errors);
            return !error?"Score DB has been saved":error;
        }
    }

    async leaderboard(req,res){
        const all = await scores_db.find({},"user score").sort({currtotal:-1,updatedAt:1});
        console.log(all);
        res.send(all);
    }

    async findscore(req,res){
        const {user} = req.params;
        console.log(user);
        const details = await scores_db.findOne({user : user});
        console.log(details);
        res.send(details);
    }

    async update_totals(req){
        const {user} = req.body;
        const all = await scores_db.find({user : user});
        all.forEach(async element => {
            let currtotal = 0;
            console.log(element.score);
            console.log(element.max);
            (element.score).forEach(ele => currtotal+=ele);
            let maxtotal = 0;
            (element.max).forEach(ele => maxtotal+=ele);
            console.log(currtotal,maxtotal);
            await scores_db.updateOne({user : element.user},{currtotal : currtotal , maxtotal : maxtotal});
        })
    }
}

module.exports = submission;