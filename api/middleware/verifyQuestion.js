const User = require("../models/User");
const Ques = require("../models/ques");

async function verifyQuestion(req, res, next) {
    const { question_id } = req.body;
    try{
        const user = await User.findOne({ regNo: decoded.regNo });
        const ques = await Ques.findOne({ question_id });
        if(!ques.isActive){
            return res.status(403).json({ message: "This question is inactive."})
        }
        if((user.roundQualified+1) !== ques.round){
            return res.status(403).json({ message: "This user is not allowed to make a submission for this question."})
        }
        req.user = decoded;
        next();
    } catch(error) {
        res.status(500).json({message: "Internal server error."})
    }
}

module.exports = verifyQuestion;