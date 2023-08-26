const express = require("express");
const router = express.Router();

const {
  createQuestion,
  getAll,
  getByRound,
  getQuestionByID,
} = require("../controllers/questions");

router.post("/createQues", createQuestion);
router.get("/getOne", getAll);
router.post("/getId", getQuestionByID);
router.post("/getRound", getByRound);

module.exports = router;
