import express from 'express';
import entryRoute from './routes/entry';
import albumRoute from './routes/album';
import albumTagRoute from './routes/album-tag';
import favouritesRoute from './routes/favourites';

const router = express.Router();

router.use('/entry', entryRoute);
router.use('/album', albumRoute);
router.use('/album/tag', albumTagRoute);
router.use('/favourites', favouritesRoute);

export default router;
