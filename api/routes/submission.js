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

router.get("/score/:user",verifyAdminToken,(req,res)=>{
  submit.findscore(req,res);
})

module.exports = router;
