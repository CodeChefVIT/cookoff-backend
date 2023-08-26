const express = require("express");
const {
  createTestCase,
  updateTestCase,
  deleteTestCase,
  fetchQuestions,
} = require("../controllers/testCasesController");
const Router = express.Router;

let router = Router();

router.post("/create", createTestCase);
router.delete("/delete", deleteTestCase);

module.exports = router;
