const submission_db = require("D:/attempted JS/cookoff-backend/schema/submission.js");

class submission{
    async create(req,res){
        const {id,user,language,code,question_id} = req.body;
        await submission_db.create({id : id, user : user, language : language, code : code, question_id : question_id})
        .then(() => console.log("Data has been entered into the DB"));
    }
    print(){
        console.log("just checking if the function call is working");
    }
}

module.exports = submission;