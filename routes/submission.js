const express = require("express");
const router = express.Router();
const submission = require("D:/attempted JS/cookoff-backend/api/submission.js");

const submit = new submission;

router.use(express.json());
router.use(express.urlencoded())

router.post('/create', (req, res) => {
    console.log("The route worked");
    submit.create(req,res);
    res.sendStatus(201);    
})

router.get("/create",(req,res) =>{
    submit.print();
    res.send("the function call worked");
})

module.exports = router