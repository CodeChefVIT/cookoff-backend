const express = require("express");
const router = express.Router();
const submission = require("../controllers/submission.js");

const submit = new submission;

router.use(express.json());
router.use(express.urlencoded())

router.post('/create', (req, res) => {
    //console.log("The route worked");
    submit.create(req,res);    
})

router.post("/test",(req,res) =>{
    submit.getdata(req,res);
})

module.exports = router