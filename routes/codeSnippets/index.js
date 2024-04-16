import express from 'express';

const router = express.Router();

router.use('/label', require('./routes/label'));
router.use('/language', require('./routes/language'));
router.use('/entry', require('./routes/entry'));

export default router;
