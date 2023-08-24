const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan")
const os = require("os");
const TestCaseRouter = require("./api/routes/testCaseRouter")
require("dotenv").config();

const app = express();

// Read MongoDB connection details from environment variables
const mongoURI = process.env.DB_URI;

console.log(mongoURI);
// Connecting to mongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Using middleware
app.use(express.json());
app.use(morgan("tiny"));

// Setting up routes
app.get("/ping", (_, res) => {
  res.status(200).json({ msg: "ping", hostname: os.hostname() });
});

app.use("/api/testcases/", TestCaseRouter)

// Starting Server
app.listen(8080, () => {
  console.log("Server started at port: 8080");
});
