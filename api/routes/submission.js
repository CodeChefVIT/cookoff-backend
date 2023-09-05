const express = require("express");
const router = express.Router();
const submission = require("../controllers/submission.js");
const {verifyAdminToken} = require("../middleware/jwtMiddleware.js");

const submit = new submission();

router.post("/eval", (req, res) => {
  submit.eval(req, res);
});

router.get("/leaderboard",verifyAdminToken,(req,res) => {
  submit.leaderboard(req,res);
})

router.get("/score/:regno",verifyAdminToken,(req,res)=>{
  submit.get_score(req,res);
})

module.exports = router;
