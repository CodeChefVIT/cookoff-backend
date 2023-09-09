const submission_db = require("../models/submission.js");
const questiondb = require("../models/ques.js");
const testdb = require("../models/testCasesModel.js");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const ObjectId = require('mongoose').Types.ObjectId


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
                Error : "Question ID was not given"
            })
            return;
        }
        if(!code){
            res.status(400).json({
                Error : "Code was not given"
            })
            return;
        }
        if(!language_id){
            res.status(400).json({
                Error : "Language ID not given"
            })
            return;
        }
        if(!ObjectId.isValid(question_id)){
            res.status(400).json({
                Error : "Question ID is not an ObjectID"
            });
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
        
        let multipler;
        switch(parseInt(language_id)){
            case 50://for C
            case 54://for C++
            case 63://for Node JS/Javascript
            case 60://for Go 
            case 73://for Rust
                multipler = 1;
                break;
            case 51://for C#
            case 62://for java
                multipler = 2;
                break;
            case 68://for PHP
                multipler = 3;
                break;
            case 71://for Python
                multipler = 5;
                break;
            default:
                res.status(400).json({
                    Error : "Invalid language ID"
                })
                return;
        }
        const testcase = await questiondb.findById(question_id,'testCases')
        if(testcase == null){
            res.status(400).json({
                Error : "Question ID doesn't exist"
            })
            return;
        }
        const testcases = testcase.testCases;
        let tests = [];
        let grp = {};
        for(let i in testcases){
            const current = await testdb.findById(testcases[i]);
            if(current == null){
                res.status(400).json({
                    Error : "Testcase ID "+testcases[i]+" doesn't exist"
                })
                return;
            }
            tests.push({
                source_code : Buffer.from(code,'binary').toString('base64'),
                language_id : language_id,
                stdin : Buffer.from(current.input,'binary').toString('base64'),
                expected_output : Buffer.from(current.expectedOutput,'binary').toString('base64'),
                cpu_time_limit : (current.time * multipler<15)?(current.time*multipler):15,
                memory_limit : (current.memory * multipler),
                redirect_stderr_to_stdout : true
            })
            const group = current.group;
            if(group in grp){
                let data = grp[group];
                data.push(parseInt(i));
                console.log(data);
                grp[group] = data; 
            }
            else{
                grp[group] = [parseInt(i)];
            }
        }

        //console.log(grp)

        //console.log(tests);

        const tokens = await axios.post("http://139.59.4.43:2358/submissions/batch?base64_encoded=true",
            {
                "submissions" : tests
            },
            {
                header : {
                    'Content-Type' : "application/JSON"
                }
            }).then(response => response.data)
            .catch((err) => {
                res.status(400).json({
                    Error : err.code
                })
                return;
            })
        if (!tokens){
            return;
        }
        let str = [];
        tokens.forEach(element => {
            str.push(element.token);
        });
        const url = "http://139.59.4.43:2358/submissions/batch?tokens="+str.toString()+
        "&base64_encoded=false&fields=status_id,stdout,expected_output,stdin";
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
            let failed = [];
            const result = await axios.get(url).then(response => response.data.submissions);
            for(let i in result){
                const element = result[i];
                switch(element.status_id){
                    case 1:
                    case 2:
                        completion = false;
                        break;
                    case 3:
                        break;
                    case 4:
                        if(element.expected_output+"\n" == element.stdout) continue;
                        else {
                            failed.push(i);
                            if(data_sent_back.input != ""){continue;}
                            data_sent_back.input = element.stdin;
                            data_sent_back.expectedOutput = element.expected_output;
                            data_sent_back.outputReceived = element.stdout;
                        }
                        break;
                    case 5:
                        failed.push(i);
                        if(data_sent_back.input != ""){continue;}
                        data_sent_back.error = "Time Limit Exceeded";
                        data_sent_back.input = element.stdin;
                        data_sent_back.expectedOutput = element.expected_output;
                        data_sent_back.outputReceived = element.stdout;
                        break;
                    case 6:
                        failed.push(i);
                        data_sent_back.error = "Complilation error";
                        data_sent_back.input = element.stdin;
                        data_sent_back.expectedOutput = element.expected_output;
                        data_sent_back.outputReceived = element.stdout;
                        break;
                    case 13:
                        failed.push(i);
                        data_sent_back.error = "Server side error please contact the nearest admin";
                        break;
                    default:
                        failed.push(i);
                        data_sent_back.error = element.status_id;
                        data_sent_back.input = element.stdin;
                        data_sent_back.expectedOutput = element.expected_output;
                        data_sent_back.outputReceived = element.stdout;
                        break;
                }
            }
            if(completion){
                //console.log(failed);
                //console.log(grp);
                Object.keys(grp).forEach(element =>{
                    let check = true;
                    const hell = grp[element];
                    for(let i in failed){
                        if(check && hell.includes(parseInt(failed[i]))){check = false;}
                    }
                    if(check){score += 1;}
                });
                data_sent_back.Sub_db = await this.create(req,reg_no,score,Object.keys(grp).length);
                await this.create_score(reg_no);
                data_sent_back.Score = score;
                res.status(201).json(data_sent_back);
                break;
            }
        }
    }

    async leaderboard(req,res){
        const all = await User.find({},'regNo score').sort({score:-1,updatedAt:1});
        res.status(200).json(all);
    }

  async create_score(user) {
    const ele = await submission_db.aggregate([
      {
        $match: { regNo: user },
      },
      {
        $group: {
          _id: "$regNo",
          total: {
            $sum: "$score",
          },
        },
      },
    ]);
    const score = ele[0].total;
    return User.updateOne({ regNo: user }, { score: score })
      .then(() => "Score = " + score)
      .catch(() => "Error occured while saving scores");
  }

  async get_reg_no(req, res) {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      res.status(401).json({ message: "Access denied. Token missing." });
      return 0;
    }
    const token = authHeader.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_KEY_SECRET);
      return decoded.regNo;
    } catch {
      res.status(401).json({ message: "Invalid token." });
      return 0;
    }
  }

  async get_score(req, res) {
    const { regno } = req.params;
    const record = await User.findOne({ regNo: regno }, "name regNo score");
    res.status(200).json(record);
  }
}
module.exports = submission;
