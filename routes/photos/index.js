const express = require('express');

const router = express.Router();

router.use('/entry', require('./routes/entry'));
router.use('/album', require('./routes/album'));
router.use('/favourites', require('./routes/favourites'));

module.exports = router;
