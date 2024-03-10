const express = require('express');

const router = express.Router();

router.get('/list', async (req, res) => {
    try {
        const { pb } = req;
        const languages = await pb.collection('code_snippets_language').getFullList();
        res.json({
            state: 'success',
            data: languages,
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
