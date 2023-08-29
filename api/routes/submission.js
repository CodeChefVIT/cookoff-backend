const express = require("express");
const router = express.Router();
const submission = require("../controllers/submission.js");

const submit = new submission();

/*router.post("/create", (req, res) => {
  //console.log("The route worked");
  submit.create(req, res);
});*/

router.post("/eval", (req, res) => {
  submit.getdata(req, res);
});

module.exports = router;
