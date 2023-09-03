const express = require("express");
const router = express.Router();
const {verifyAdminToken} = require("../middleware/jwtMiddleware.js");

const {
  createQuestion,
  getAll,
  getByRound,
  getQuestionByID,
  updateQuestion,
  deleteQuestion,
  getAllAdmin,
  getByRoundAdmin,
  getQuestionByIDAdmin
} = require("../controllers/questions");

router.post("/createQues", verifyAdminToken, createQuestion);
router.get("/getOne", getAll);  
router.post("/getId", getQuestionByID);
router.post("/getRound", getByRound);
router.put("/updateQuestion/:id", updateQuestion);
router.delete("/deleteQuestion/:id",deleteQuestion);
router.get("/admin/getOne",verifyAdminToken, getAllAdmin);  
router.post("/admin/getId", verifyAdminToken,  getQuestionByIDAdmin);
router.post("/admin/getRound", verifyAdminToken, getByRoundAdmin);
module.exports = router;