const express = require("express");
const {
  createTestCase,
  updateTestCase,
  deleteTestCase,
} = require("../controllers/testCasesController");
const { verifyAdminToken } = require("../middleware/jwtMiddleware");
const Router = express.Router;

const router = Router();
router.use(verifyAdminToken);
router.post("/create", createTestCase);
router.delete("/delete/:id", deleteTestCase);
router.patch("/update/:id", updateTestCase);

module.exports = router;
