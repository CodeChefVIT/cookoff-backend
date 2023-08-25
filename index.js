<<<<<<< HEAD
const express = require('express');
const mongoose = require('mongoose');
const authRoute = require('./api/routes/auth');
=======
const express = require("express");
const mongoose = require("mongoose");

const morgan = require("morgan")
const os = require("os");
const TestCaseRouter = require("./api/routes/testCaseRouter")

require("dotenv").config();

>>>>>>> 805fefe827ae9e1dc7e7410c099a2f513d9607c1
const app = express();
const port = 3000;

<<<<<<< HEAD
=======
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
>>>>>>> 805fefe827ae9e1dc7e7410c099a2f513d9607c1
app.use(express.json());
app.use(authRoute);

<<<<<<< HEAD
mongoose.connect('mongodb+srv://tnvjain2003:z6sr6BKmWm8PQmmx@cluster0.g8mzbed.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('connected to db');
})
.catch(error => {
  console.error('error connecting', error);
});

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
=======
// Setting up routes
app.get("/ping", (_, res) => {
  res.status(200).json({ msg: "ping", hostname: os.hostname() });
});


app.use("/api/testcases/", TestCaseRouter)


// Starting Server
app.listen(8080, () => {
  console.log("Server started at port: 8080");
>>>>>>> 805fefe827ae9e1dc7e7410c099a2f513d9607c1
});
