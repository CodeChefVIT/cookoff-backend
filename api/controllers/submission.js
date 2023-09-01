const submission_db = require("../models/submission.js");
const questiondb = require("../models/ques.js");
const testdb = require("../models/testCasesModel.js");
const axios = require("axios");
const scores_db = require("../models/score.js");
const user = require("../models/User.js");
const jwt = require("jsonwebtoken");


class submission{
    async create(req,res,score,max){
        const {user,language_id,code,question_id} = req.body;
        const check = await submission_db.findOne({user : user , question_id : question_id});
        let error = "";
        if(check){
            return await submission_db.updateOne({user : user, question_id : question_id},
                {code : code,language_id : language_id,score : score,max_score :max})
            .then(() => "Submission record has been updated")
            .catch(() => "Error faced during updating the sub DB");
        }
        else{
            return await submission_db.create({user : user, language_id : language_id, code : code, question_id : question_id,score : score,max_score : max})
            .then(() => "Submission record has been saved")
            .catch(err => "Error faced during creating the entry");
        }
    }

    async eval(req,res){
        const reg_no = await this.get_reg_no(req,res);
        console.log(reg_no);
        if(reg_no == 0) return;
        const {question_id,code,language_id} = req.body;
        if(!question_id){
            res.status(400).json({
                message : "Question ID was not given"
            })
            return;
        }
        if(!code){
            res.status(400).json({
                message : "Code was not given"
            })
            return;
        }
        if(!language_id){
            res.status(400).json({
                message : "Language ID not given"
            })
            return;
        }
        const check = await submission_db.findOne({user : user,question_id : question_id},"code");
        if(check && check.code == code){
            res.status(200).json({
                message : "No changes in source code"
            });
            return;
        }
        const testcase = await questiondb.findById(question_id,'testCases');
        const testcases = testcase.testCases;
        let tests = [];
        for(let i in testcases){
            const current = await testdb.findById(testcases[i]);
            console.log(btoa(code));
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
        let str = [];
        tokens.forEach(element => {
            str.push(element.token);
        });
        const url = "http://139.59.4.43:2358/submissions/batch?tokens="+str.toString()+
        "&base64_encoded=false&fields=status_id,stdout,stderr,expected_output";
        console.log(url);
        let completion = false;
        let data_sent_back = {
            error : "",
            admin_logs : "",
            Sub_db : "",
            Score_db : "",
            leaderbd : ""
        };
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
                        data_sent_back.error = "Expected output :- "+element.expected_output+ "\n but received " + element.stdout;
                        break;
                    case 5:
                        data_sent_back.error = "Time limit exceeded";
                        break;
                    case 6:
                        data_sent_back.error = "Complilation error :-" + element.stderr;
                        break;
                    case 13:
                        data_sent_back.error = "Server side error please contact the nearest admin";
                        break;
                    default:
                        data_sent_back.error = "Runtime error was faced :- " + element.stderr;
                        data_sent_back.admin_logs = "Runtime error is of code " + element.status_id;
                        break;
                }
            })
            console.log(data_sent_back);
            if(completion){
                data_sent_back.Sub_db = await this.create(req,res,score,result.length);
                data_sent_back.Score_db =await this.create_score(req,score,result.length);
                data_sent_back.leaderbd = await this.update_totals(req,res);
                res.status(201).json(data_sent_back);
            }
        }
    }

    async create_score(req,res,score,maxscore){
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
            return await scores_db.updateOne({user : user},{score : scr, max : maxscr,question_id : quest},{upsert : true})
                    .then(() => "Score DB has been saved")
                    .catch(err => "Error faced while updating scores");
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

    async update_totals(req,res){
        const {user} = req.body;
        const element = await scores_db.findOne({user : user});
        let currtotal = 0;
        console.log(element.score);
        console.log(element.max);
        (element.score).forEach(ele => currtotal+=ele);
        let maxtotal = 0;
        (element.max).forEach(ele => maxtotal+=ele);
        console.log(currtotal,maxtotal);
        return (await scores_db.updateOne({user : user},{currtotal : currtotal , maxtotal : maxtotal})
                .then(() => "The leaderboards are updated")
                .catch(() => "Error faced while updating the leaderboards"));
    }

    async get_reg_no(req,res){
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            res.status(401).json({ message: 'Access denied. Token missing.' });
            return 0;
        }
        const token = authHeader.replace('Bearer ', '');
        try{   
            const decoded = jwt.verify(token, process.env.ACCESS_KEY_SECRET);
            return decoded.regNo;
        } catch{
            res.status(401).json({ message: 'Invalid token.' });
            return 0;
        }
    }
}
module.exports = submission;