const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");
const Ques = require("../models/ques");

async function verifyAccessToken(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_KEY_SECRET);
    const user = await User.findOne({ regNo: decoded.regNo });
    if (!user.isActive) {
      return res.status(403).json({ error: "User is banned" });
    }
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
}

async function verifyRefreshToken(req, res, next) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "refreshToken is required" });
  }
  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(404).json({ message: "Please login again." });
    }
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refreshToken" });
    }
    jwt.verify(refreshToken, process.env.REFRESH_KEY_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "refreshToken expired" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

async function verifyAdminToken(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_KEY_SECRET);
    const user = await User.findOne({ regNo: decoded.regNo });
    const role = decoded.userRole;
    if (
      !user ||
      user.tokenVersion !== decoded.tokenVersion ||
      role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
}

async function verifyQuestion(req, res, next) {
  const { question_id } = req.body;
  try {
    const user = await User.findOne({ regNo: req.user.regNo });
    const ques = await Ques.findOne({ _id: question_id });
    //console.log(ques);
    if (!ques) {
      return res.status(400).json({ message: "Question not found" });
    }
    if (!ques.isActive) {
      return res.status(400).json({ message: "This question is inactive." });
    }
    if (!user.isRoundActive) {
      return res
        .status(400)
        .json({ message: "User has submitted the test already." });
    }
    if (user.roundQualified !== ques.round) {
      return res.status(400).json({
        message:
          "This user is not allowed to make a submission for this question.",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = {
  verifyAccessToken,
  verifyRefreshToken,
  verifyAdminToken,
  verifyQuestion,
};
