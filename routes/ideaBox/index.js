const express = require('express');
const router = express.Router();

router.use('/container', require('./routes/container'));
router.use('/idea', require('./routes/idea'));

module.exports = router;