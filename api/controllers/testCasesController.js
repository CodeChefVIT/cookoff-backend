const express = require("express")
import TestCaseModel from "./testCasesModel.js"

async function createTestCases(req, res) {
  try {
    const testCase = await TestCaseModel.create({
      expectedOutput: req.body.expectedOutput,
      input: req.body.input,
      number: req.body.number,
      hidden: req.body.hidden,
      time: req.body.time,
      memory: req.body.memory,
      question: req.body.question
    });

    return res.status(201).json(testCase);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong"
    })
  }
}

export default createTestCases
