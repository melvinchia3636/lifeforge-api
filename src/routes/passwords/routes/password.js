/* eslint-disable no-param-reassign */
import express from 'express';
import crypto from 'crypto';
import { success } from '../../../utils/response.js';
import asyncWrapper from '../../../utils/asyncWrapper.js';

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

router.get('/decrypt/:id', asyncWrapper(async (req, res) => {
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

    success(res, decryptedPassword.toString());
}));

router.get('/list', asyncWrapper(async (req, res) => {
    const { pb } = req;

    const passwords = await pb.collection('passwords_entry').getFullList();

    success(res, passwords);
}));

router.post('/create', asyncWrapper(async (req, res) => {
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

    success(res);
}));

router.delete('/delete/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            state: 'error',
            message: 'ID is required',
        });
        return;
    }
    
    const { pb } = req;

    await pb.collection('passwords_entry').delete(id);

    success(res);
}));

export default router;
