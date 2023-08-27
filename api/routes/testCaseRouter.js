const express = require("express");
const {
  createTestCase,
  updateTestCase,
  deleteTestCase,
} = require("../controllers/testCasesController");
const Router = express.Router;

let router = Router();

router.post("/create", createTestCase);
router.delete("/delete/:id", deleteTestCase);
router.patch("/update/:id", updateTestCase);

module.exports = router;
