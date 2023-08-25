const express = require("express");
const { default: createTestCases } = require("../controllers/testCasesController");
const Router = express.Router;


let router = Router()

router.post("/admin/testcases/create", createTestCases);

export default router;
