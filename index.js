const express = require('express');
const mongoose = require('mongoose');
const authRoute = require('./api/routes/auth');
const app = express();
const port = 3000;

app.use(express.json());
app.use(authRoute);

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
});