const express = require('express');
const dotenv = require('dotenv');
dotenv.config('.env')
const app = express();
const router = require('./routers/index.js');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

module.exports = {app};
