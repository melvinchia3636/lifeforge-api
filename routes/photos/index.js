const express = require('express');

const router = express.Router();

router.use('/entry', require('./routes/entry'));
router.use('/album', require('./routes/album'));

module.exports = router;
