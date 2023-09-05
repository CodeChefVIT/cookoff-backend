const submission_db = require("../models/submission.js");
const questiondb = require("../models/ques.js");
const testdb = require("../models/testCasesModel.js");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { get } = require("../routes/submission.js");


class submission{
    async create(req,user,score,max){
        const {language_id,code,question_id} = req.body;
        const check = await submission_db.findOne({regNo : user , question_id : question_id});
        let error = "";
        if(check){
            return await submission_db.updateOne({regNo : user, question_id : question_id},
                {code : code,language_id : language_id,score : score,max_score :max})
            .then(async () => "Submission record has been updated")
            .catch(() => "Error faced during updating the sub DB");
        }
        else{
            return await submission_db.create({regNo : user, language_id : language_id, code : code, question_id : question_id,score : score,max_score : max})
            .then(() => "Submission record has been saved")
            .catch(err => "Error faced during creating the entry");
        }
    }

    async eval(req,res){
        const reg_no = await this.get_reg_no(req,res);
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
        const check = await submission_db.findOne({regNo : reg_no,question_id : question_id},"code score");
        if(check && check.code == code){
            await this.create_score(reg_no);
            res.status(201).json({
                message : "No changes in source code",
                Score : check.score,
            });
            return;
        }
        
        const testcase = await questiondb.findById(question_id,'testCases');
        const testcases = testcase.testCases;
        let tests = [];
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
        "&base64_encoded=false&fields=status_id,stdout,stderr,expected_output,stdin";
        console.log(url);
        let completion = false;
        let data_sent_back = {
            input : "",
            expectedOutput : "",
            outputReceived :"",
            error : "",
            Sub_db : "",
            Score : ""
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
                        if(element.expected_output+"\n" == element.stdout) score +=1;
                        else {
                            data_sent_back.error = element.stderr;
                            data_sent_back.input = element.stdin;
                            data_sent_back.expectedOutput = element.expected_output;
                            data_sent_back.outputReceived = element.stdout;
                            completion = true;
                        }
                        break;
                    case 5:
                        data_sent_back.error = element.stderr;
                        data_sent_back.input = element.stdin;
                        data_sent_back.expectedOutput = element.expected_output;
                        data_sent_back.outputReceived = element.stdout;
                        break;
                    case 6:
                        data_sent_back.error = element.stderr;
                        data_sent_back.input = element.stdin;
                        data_sent_back.expectedOutput = element.expected_output;
                        data_sent_back.outputReceived = element.stdout;
                        break;
                    case 13:
                        data_sent_back.error = "Server side error please contact the nearest admin";
                        break;
                    default:
                        data_sent_back.error = element.stderr;
                        data_sent_back.input = element.stdin;
                        data_sent_back.expectedOutput = element.expected_output;
                        data_sent_back.outputReceived = element.stdout;
                        break;
                }
            })
            if(completion){
                data_sent_back.Sub_db = await this.create(req,reg_no,score,result.length);
                await this.create_score(reg_no);
                data_sent_back.Score = await this.findscore(reg_no,question_id);
                res.status(201).json(data_sent_back);
                break;
            }
        }
    }

    async leaderboard(req,res){
        const all = await User.find({},'regNo score').sort({score:-1,updatedAt:1});
        res.status(200).json(all);
    }

    async findscore(user, question_id){
        const details = await submission_db.findOne({regNo : user,question_id : question_id});
        return details.score;
    }

    async create_score(user){
        const ele = await submission_db.aggregate([
            {
                $match : {regNo : user}
            },
            {
                $group : {
                    _id : "$regNo",
                    total : {
                        $sum : "$score"
                    }
                }
            }
        ])
        const score = ele[0].total;
        return User.updateOne({regNo : user},{score : score})
        .then(() => "Score = " + score)
        .catch(() => "Error occured while saving scores");
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

    async get_score(req,res){
        const {regno} = req.params;
        const record = await User.findOne({regNo : regno},"name regNo score");
        res.status(200).json(record);
    }

}
module.exports = submission;