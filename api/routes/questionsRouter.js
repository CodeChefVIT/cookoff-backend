const express = require("express");
const router = express.Router();
const {verifyAccessToken,verifyAdminToken} = require("../middleware/jwtMiddleware.js");

const {
  createQuestion,
  getAll,
  getByRound,
  getQuestionByID,
  updateQuestion,
  deleteQuestion
} = require("../controllers/questions");

router.use(verifyAccessToken)
router.post("/createQues", verifyAdminToken, createQuestion); 
router.get("/getOne", getAll);  
router.post("/getId", getQuestionByID);
router.post("/getRound", getByRound);
router.put("/updateQuestion/:id", verifyAdminToken, updateQuestion);
router.delete("/deleteQuestion/:id",verifyAdminToken, deleteQuestion);

module.exports = router;