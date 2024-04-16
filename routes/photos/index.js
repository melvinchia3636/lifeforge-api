import express from 'express';
import entryRoute from './routes/entry.js';
import albumRoute from './routes/album.js';
import favouritesRoute from './routes/favourites.js';

const router = express.Router();

router.use('/entry', entryRoute);
router.use('/album', albumRoute);
router.use('/favourites', favouritesRoute);

export default router;
