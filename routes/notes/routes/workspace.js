import express from 'express';

const router = express.Router();

router.get('/get/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                state: 'error',
                message: 'id is required',
            });

            return;
        }

        const { pb } = req;
        const category = await pb
            .collection('notes_workspace')
            .getOne(req.params.id);

        res.json({
            state: 'success',
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

router.get('/valid/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                state: 'error',
                message: 'id is required',
            });

            return;
        }

        const { pb } = req;

        const { totalItems } = await pb.collection('notes_workspace').getList(1, 1, {
            filter: `id = "${req.params.id}"`,
        });

        if (totalItems === 1) {
            res.json({
                state: 'success',
                data: true,
            });
        } else {
            res.json({
                state: 'success',
                data: false,
            });
        }
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

router.get('/list', async (req, res) => {
    try {
        const { pb } = req;
        const categories = await pb.collection('notes_workspace').getFullList();

        res.json({
            state: 'success',
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

export default router;
