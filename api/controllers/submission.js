const submission_db = require("../models/submission.js");
const questiondb = require("../models/ques.js");
const testdb = require("../models/testCasesModel.js");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const ObjectId = require("mongoose").Types.ObjectId;
require("dotenv").config();
const Judge0 = process.env.JUDGE_URI;

class submission {
  async create(req, user, score, max, result, time, passed) {
    //console.log(result);
    const { language_id, code, question_id } = req.body;
    const check = await submission_db.findOne({
      regNo: user,
      question_id: question_id,
    });
    if (check) {
      return await submission_db
        .updateOne(
          { regNo: user, question_id: question_id },
          {
            code: code,
            language_id: language_id,
            score: score,
            max_score: max,
            lastResults: result,
            runtime: time,
            testcases_passed: passed
          },
        )
        .then(() => "Submission record has been updated")
        .catch(() => "Error faced during updating the sub DB");
    } else {
      return await submission_db
        .create({
          regNo: user,
          language_id: language_id,
          code: code,
          question_id: question_id,
          score: score,
          max_score: max,
          lastResults: result,
          runtime: time,
          testcases_passed: passed
        })
        .then(() => "Submission record has been saved")
        .catch((err) => "Error faced during creating the entry");
    }
  }

  async eval(req, res) {
    const reg_no = await this.get_reg_no(req, res);
    if (reg_no == 0) return;
    const { question_id, code, language_id } = req.body;
    if (!question_id) {
      res.status(400).json({
        Error: "Question ID was not given",
      });
      return;
    }
    if (!code) {
      res.status(400).json({
        Error: "Code was not given",
      });
      return;
    }
    if (!language_id) {
      res.status(400).json({
        Error: "Language ID not given",
      });
      return;
    }
    if (!ObjectId.isValid(question_id)) {
      res.status(400).json({
        Error: "Question ID is not an ObjectID",
      });
      return;
    }
    const check = await submission_db.findOne(
      { regNo: reg_no, question_id: question_id },
      "code score lastResults allPassesAt",
    );
    //console.log(!check.allPassesAt);
    if (check && check.code == code) {
      await this.create_score(reg_no);
      const max = await questiondb.findById(question_id,"testcases");
      if (!check.lastResults[0]) {
        res.status(201).json({
          error: check.lastResults,
          Sub_db: "No changes in source code",
          Score: check.score,
          test_passed : check.testcases_passed,
          no_of_test : max.length
        });
        return;
      }
    }
    let multipler;
    switch (parseInt(language_id)) {
      case 50: //for C
      case 54: //for C++
      case 63: //for Node JS/Javascript
      case 60: //for Go
      case 73: //for Rust
        multipler = 1;
        break;
      case 51: //for C#
      case 62: //for java
        multipler = 2;
        break;
      case 68: //for PHP
        multipler = 3;
        break;
      case 71: //for Python
        multipler = 5;
        break;
      default:
        res.status(400).json({
          Error: "Invalid language ID",
        });
        return;
    }
    const testcase = await questiondb.findById(question_id, "testCases");
    if (testcase == null) {
      res.status(400).json({
        Error: "Question ID doesn't exist",
      });
      return;
    }
    const testcases = testcase.testCases;
    if (testcases.length == 0) {
      res.status(400).json({
        Error: "Testcases are not present",
      });
      return;
    }
    let tests = [];
    let grp = {};
    for (let i in testcases) {
      const current = await testdb.findById(testcases[i]);
      if (current == null) {
        res.status(400).json({
          Error: "Testcase ID " + testcases[i] + " doesn't exist",
        });
        return;
      }
      tests.push({
        source_code: Buffer.from(code, "binary").toString("base64"),
        language_id: language_id,
        stdin: Buffer.from(current.input, "binary").toString("base64"),
        expected_output: Buffer.from(current.expectedOutput, "binary").toString(
          "base64",
        ),
        cpu_time_limit:
          current.time * multipler < 15 ? current.time * multipler : 15,
        memory:
          current.memory * multipler < 2048 ? 2048 : current.memory * multipler
        //redirect_stderr_to_stdout: true,
      });
      const group = current.group;
      if (group in grp) {
        let data = grp[group];
        data.push(parseInt(i));
        //console.log(data);
        grp[group] = data;
      } else {
        grp[group] = [parseInt(i)];
      }
    }

    //console.log(grp)

    //console.log(tests);

    const tokens = await axios
      .post(
        Judge0 + "/submissions/batch?base64_encoded=true",
        {
          submissions: tests,
        },
        {
          header: {
            "Content-Type": "application/JSON",
          },
        },
      )
      .then((response) => response.data)
      .catch((err) => {
        res.status(400).json({
          Error: err.code,
        });
        return;
      });
    if (!tokens) {
      return;
    }
    let str = [];
    tokens.forEach((element) => {
      str.push(element.token);
    });
    const url = Judge0 +
      "/submissions/batch?tokens=" +
      str.toString() +
      "&base64_encoded=true&fields=status_id,stderr,compile_output,expected_output,stdout,time";
    console.log(url);
    let completion = false;
    let data_sent_back = {
      error: [false, false, false, false], //false means it passed that grp
      //[complilation error/runtime,time limit exceeded, O/P failed]
      Sub_db: "",
      Score: "",
      test_passed : "",
      no_of_test : ""
    };
    while (!completion) {
      let runtime = 0;
      let score = 0;
      completion = true;
      let failed = [];
      const result = await axios
        .get(url)
        .then((response) => response.data.submissions);
      let error = "";
      for (let i in result) {
        const element = result[i];
        switch (element.status_id) {
          case 1:
          case 2:
            completion = false;
            break;
          case 3:
            //console.log(Buffer.from(element.expected_output,"base64").toString("utf-8"));
            runtime += parseFloat(element.time);
            break;
          case 4:
            //console.log(Buffer.from(element.expected_output,"base64").toString("utf-8"));
            //console.log(Buffer.from(element.stdout,"base64").toString("utf-8"));
            if (element.stdout == null){
              data_sent_back.error[3] = true;
              failed.push(i);
              continue;
            }
            if (
              Buffer.from(element.stdout, "base64").toString("utf-8") + "\n" ==
              Buffer.from(element.expected_output, "base64").toString(
                "utf-8",
              ) ||
              Buffer.from(element.stdout, "base64").toString("utf-8") ==
              Buffer.from(element.expected_output, "base64").toString("utf-8")
            ) {
              runtime += parseFloat(element.time);
            } else {
              data_sent_back.error[3] = true;
              failed.push(i);
            }
            break;
          case 5:
            failed.push(i);
            data_sent_back.error[2] = true;
            error = element.compile_output;
            break;
          case 6:
            failed.push(i);
            data_sent_back.error[0] = true;
            break;
          case 13:
            failed.push(i);
            /*data_sent_back.error =
              "Server side error please contact the nearest admin";*/
            res.status().json({
              Error: "Judge0 side error",
            });
            return;
          default:
            failed.push(i);
            data_sent_back.error[0] = true;
            error = (error=="")?element.stderr:error;
            break;
        }
      }
      //console.log(runtime);
      if (tests.length == failed.length) runtime = 0;
      else runtime = runtime / (tests.length - failed.length);
      //console.log(tests.length,failed.length);
      runtime = runtime / multipler;
      //console.log("runtime = ", runtime);
      if (completion) {
        //Checking whether complilation error or runtime error
        if (failed.length != tests.length && data_sent_back.error[0]) {
          data_sent_back.error[0] = false;
          data_sent_back.error[1] = true;
          data_sent_back.error[2] = true;
          data_sent_back.error[3] = true;
        }

        //In case of complilation error the following code will run
        if (data_sent_back.error[0]) {
          const msg = result[0].compile_output != null
            ? Buffer.from(result[0].compile_output, "base64").toString(
              "utf-8",
            )
            : Buffer.from(error, "base64").toString("utf-8");
          data_sent_back.Sub_db = "Not saved in Sub DB(complilation error)";
          res.status(201).json({
            error: data_sent_back.error,
            Sub_db: data_sent_back.Sub_db,
            message: msg,
          });
          return;
        }

        if(data_sent_back.error[2]) data_sent_back.error[3] = true;

        //Calculate the score of the given code
        Object.keys(grp).forEach((element) => {
          let check = true;
          const hell = grp[element];
          for (let i in failed) {
            if (check && hell.includes(parseInt(failed[i]))) {
              check = false;
            }
          }
          if (check) {
            score += 1;
          }
        });

        
        //comparing the score with the existing score and picking the best one
        data_sent_back.Score =
          !check || score >= check.score ? score : check.score;
        //console.log(data_sent_back.Score, score);

        //If new score is higher or equal to the existing score, then sub DB is updated
        if (data_sent_back.Score == score) {
          data_sent_back.Sub_db = await this.create(
            req,
            reg_no,
            score,
            Object.keys(grp).length,
            data_sent_back.error,
            runtime,
            (tests.length - failed.length)
          );
          await this.create_score(reg_no);
        } else {
          data_sent_back.Sub_db = "No changes in Sub DB";
          await this.create_score(reg_no);
        }
        data_sent_back.test_passed = (tests.length - failed.length);
        data_sent_back.no_of_test = tests.length;

        //Creation of allPassesAt field when all testcases are passed
        if (
          !data_sent_back.error.includes(true) &&
          (!check || !check.allPassesAt)
        ) {
          this.update_time_passed(reg_no, question_id);
        }
        res.status(201).json(data_sent_back);
        break;
      }
    }
  }

  async leaderboard(req, res) {
    const all = await User.find({}, "regNo score").sort({
      score: -1,
      submissionTime: 1,
      updatedAt: 1,
    });
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
      .catch(() => console.error("Error occured while saving scores \nRegno :" + regNo + "\tScore :" + score));
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

  async get_all(req, res) {
    const { regno } = req.params;
    //console.log(regno);
    const record = await submission_db.find(
      { regNo: regno },
      "code score question_id lastResults language_id",
    );
    //console.log(record);
    if (record.length == 0) {
      res.status(400).json({
        Error: "Invalid regNo",
      });
      return;
    }
    let msg = [];
    record.forEach((element) => {
      const results = element.lastResults;
      const compilation_error = results[0];
      const runtime_error = results[1];
      const time_limit_exceeded = results[2];
      const output_no_match = results[3];
      const data = {
        question_id: element.question_id,
        code: element.code,
        score: element.score,
        compilation_error: compilation_error,
        runtime_error: runtime_error,
        time_limit_exceeded: time_limit_exceeded,
        output_did_not_match: output_no_match,
        language_id: element.language_id,
      };
      msg.push(data);
    });
    res.status(200).json(msg);
  }

  async update_time_passed(user, question_id) {
    const curr_time = new Date().getTime();
    await User.updateOne({ regNo: user }, { submissionTime: curr_time });
    return await submission_db
      .updateOne(
        {
          regNo: user,
          question_id: question_id,
        },
        { allPassesAt: curr_time },
      )
      .then(() => "Updated all testcases timestamp")
      .catch(() => "Failed to update the timestamp");
  }

  async endtest(req, res) {
    try {
      const user = await User.findOne({ regNo: req.user.regNo });
      if (!user) {
        return res
          .status(400)
          .json({ status: false, message: "User Not Found" });
      }
      user.isRoundActive = false;
      await user.save();
      return res
        .status(200)
        .json({ status: true, message: "Test ended succesfully" });
    } catch (error) {
      return res.status(500).json({ status: false, error: error });
    }
  }

  async round_lb(req, res) {
    const { round } = req.params;
    const QID = await questiondb.find({ round: round }, "_id");
    let question = [];
    QID.forEach((ele) => question.push(ele._id.toString()));
    const all_submit = await submission_db.find({
      question_id: { "$in": question },
    }, "regNo score question_id runtime allPassesAt");
    let leaderboard = {};
    all_submit.forEach((ele) => {
      if (ele.regNo in leaderboard) {
        let data = leaderboard[ele.regNo];
        data[0] += ele.score;
        data[1] = data[1] > ele.allPassesAt ? ele.allPassesAt : data[1];
        data[2] += ele.runtime;
        //console.log(data);
        leaderboard[ele.regNo] = data;
      } else {
        leaderboard[ele.regNo] = [ele.score, ele.allPassesAt, ele.runtime];
      }
    });
    let items = Object.keys(leaderboard).map(function (key) {
      return [key, leaderboard[key]];
    });
    items.sort(function (a, b) {
      //console.log(a[1][0]);
      if (a[1][0] > b[1][0]) return -1;
      if (a[1][0] < b[1][0]) return 1;
      if (a[1][1] > b[1][1]) return 1;
      if (a[1][1] < b[1][1]) return -1;
    });
    res.status(200).json(items);
  }

  async get_round(req, res) {
    const { regno,round } = req.params;
    //console.log(req.params);
    //console.log(regno,round);
    //console.log(regno);
    const question = await questiondb.find(
      {round : round},"_id name points"
    );
    let ids = [];
    question.forEach((ele) => ids.push(ele._id.toString()));
    console.log(ids);
    const record = await submission_db.find(
      { regNo: regno , question_id : {"$in" : ids}},
      "code score question_id lastResults language_id",
    );
    //console.log(record);
    if (record.length == 0) {
      res.status(400).json({
        Error: "Invalid regNo",
      });
      return;
    }
    let msg = [];
    let i = 0;
    let number = 0;
    record.forEach((element) => {
      const curr = question[ids.indexOf(element.question_id.toString())];
      const name = curr.name;
      const points = curr.points;
      const results = element.lastResults;
      const compilation_error = results[0];
      const runtime_error = results[1];
      const time_limit_exceeded = results[2];
      const output_no_match = results[3];
      const data = {
        question_id: element.question_id,
        name : name,
        points : points,
        code: element.code,
        score: element.score,
        compilation_error: compilation_error,
        runtime_error: runtime_error,
        time_limit_exceeded: time_limit_exceeded,
        output_did_not_match: output_no_match,
        language_id: element.language_id,
      };
      msg.push(data);
    });
    res.status(200).json(msg);
  }
}
module.exports = submission;
