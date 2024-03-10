const express = require('express');

const router = express.Router();

router.use('/entry', require('./routes/entry'));
router.use('/list', require('./routes/list'));
router.use('/tag', require('./routes/tag'));

module.exports = router;
