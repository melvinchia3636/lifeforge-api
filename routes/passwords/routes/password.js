/* eslint-disable no-param-reassign */
const express = require('express');
const crypto = require('crypto');

const router = express.Router();

const ALGORITHM = 'aes-256-ctr';

const encrypt = (buffer, key) => {
    const iv = crypto.randomBytes(16);
    key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return result;
};

const decrypt = (encrypted, key) => {
    const iv = encrypted.slice(0, 16);
    encrypted = encrypted.slice(16);
    key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return result;
};

router.get('/decrypt/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { master } = req.query;
        const { pb } = req;

        if (!master) {
            res.status(400).json({
                state: 'error',
                message: 'Master password is required',
            });
            return;
        }

        if (!id) {
            res.status(400).json({
                state: 'error',
                message: 'ID is required',
            });
            return;
        }

        const password = await pb.collection('passwords_entry').getOne(id);

        const decryptedPassword = decrypt(Buffer.from(password.password, 'base64'), master);

        res.json({
            state: 'success',
            data: decryptedPassword.toString(),
        });
    } catch (e) {
        res.status(500).json({
            state: 'error',
            message: e.message,
        });
    }
});

router.get('/list', async (req, res) => {
    try {
        const { pb } = req;

        const passwords = await pb.collection('passwords_entry').getFullList();

        res.json({
            state: 'success',
            data: passwords,
        });
    } catch (e) {
        res.status(500).json({
            state: 'error',
            message: e.message,
        });
    }
});

router.post('/create', async (req, res) => {
    try {
        const {
            name,
            icon,
            color,
            website,
            username,
            password,
            masterPassword,
        } = req.body;
        const { pb } = req;

        const encryptedPassword = encrypt(Buffer.from(password), masterPassword);

        await pb.collection('passwords_entry').create({
            name,
            icon,
            color,
            website,
            username,
            password: encryptedPassword.toString('base64'),
        });

        res.json({
            state: 'success',
        });
    } catch (e) {
        res.status(500).json({
            state: 'error',
            message: e.message,
        });
    }
});

module.exports = router;
