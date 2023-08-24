const express = require("express");
const createTestCases = require("../controllers/testCasesController");
const Router = express.Router;


let router = Router()

router.post("/create", createTestCases);

module.exports = router;
