const express = require('express');
const projectRouter = require('./project');
const router = express.Router();
router.use('/project', projectRouter);


module.exports = router;