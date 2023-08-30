const express = require("express");
const router = express.Router();
const submission = require("../controllers/submission.js");

const submit = new submission();

router.post("/eval", (req, res) => {
  submit.getdata(req, res);
});

module.exports = router;
