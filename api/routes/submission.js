const express = require("express");
const router = express.Router();
const submission = require("../controllers/submission.js");

const submit = new submission();

router.post("/eval", (req, res) => {
  submit.eval(req, res);
});

router.get("/leaderboard",(req,res) => {
  submit.leaderboard(req,res);
})

router.get("/score/:user",(req,res)=>{
  submit.findscore(req,res);
})

router.get("/regno", (req,res) => {
  submit.get_reg_no(req,res);
})

module.exports = router;
