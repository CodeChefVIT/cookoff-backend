const express = require("express");
const router = express.Router();

const {
  createQuestion,
  getAll,
  getByRound,
  getQuestionByID,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questions");

router.post("/createQues", createQuestion);
router.get("/getOne", getAll);
router.post("/getId", getQuestionByID);
router.post("/getRound", getByRound);
router.post("/updateQuestion", updateQuestion);
router.post("/deleteQuestion",deleteQuestion);
module.exports = router;
