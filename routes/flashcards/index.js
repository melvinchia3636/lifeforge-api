const express = require('express');

const router = express.Router();

router.use('/tag', require('./routes/tag'));
router.use('/deck', require('./routes/deck'));
router.use('/card', require('./routes/card'));

module.exports = router;
