/* eslint-disable no-param-reassign */
const express = require('express');

const router = express.Router();

router.get('/get/:id', async (req, res) => {
    try {
        const { pb } = req;
        const { id } = req.params;

        if (!id) {
            res.status(400)
                .json({
                    state: 'error',
                    message: 'id is required',
                });
            return;
        }

        const container = await pb.collection('code_snippets_entry').getOne(id);
        res.json({
            state: 'success',
            data: container,
        });
    } catch (error) {
        res.status(500)
            .json({
                state: 'error',
                message: error.message,
            });
    }
});

router.get('/list', async (req, res) => {
    try {
        const { pb } = req;
        const containers = (await pb.collection('code_snippets_entry').getFullList()).map((container) => {
            delete container.code;
            return container;
        });
        res.json({
            state: 'success',
            data: containers,
        });
    } catch (error) {
        res.status(500)
            .json({
                state: 'error',
                message: error.message,
            });
    }
});

router.put('/create', async (req, res) => {
    try {
        const { pb } = req;
        const { name, color, icon } = req.body;
        const container = await pb.collection('code_snippets_entry').create({
            name,
            color,
            icon,
        });
        res.json({
            state: 'success',
            data: container,
        });
    } catch (error) {
        res.status(500)
            .json({
                state: 'error',
                message: error.message,
            });
    }
});

module.exports = router;
