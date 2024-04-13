/* eslint-disable consistent-return */
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/master/create', (req, res) => {
    try {
        const { password, id } = req.body;
        const { pb } = req;

        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                throw new Error('Error creating master password');
            }

            await pb.collection('users').update(id, {
                masterPasswordHash: hash,
            });

            res.json({ hash });
        });
    } catch (error) {
        res.status(500).send({
            state: 'error',
            message: error.message,
        });
    }
});

module.exports = router;
