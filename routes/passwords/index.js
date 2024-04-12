/* eslint-disable no-param-reassign */
const express = require('express');

const router = express.Router();

router.use('/master', require('./routes/master'));
router.use('/password', require('./routes/password'));

module.exports = router;
