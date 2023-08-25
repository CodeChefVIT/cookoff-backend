const express = require("express");
const {createQuestion, getAll, getByRound, getQuestionByID, } = require("../controllers/questions");
const Router = express.Router;


let router = Router()

router.post("/createQues",createQuestion);
router.post("/getOne",getAll);
router.post("/getId",getQuestionByID);
router.post("/getRound", getByRound)
// module.exports = router;

