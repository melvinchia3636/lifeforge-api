import express from 'express';
import passkey from './routes/passkey.js';
import Pocketbase from 'pocketbase';
import { success } from '../../utils/response.js';
import asyncWrapper from '../../utils/asyncWrapper.js';

const router = express.Router();

router.use('/passkey', passkey);

router.post("/auth/login", asyncWrapper(async (req, res) => {
    const { email, password } = req.body;
    const pb = new Pocketbase(process.env.PB_HOST);

    await pb.collection("users").authWithPassword(email, password);

    if (pb.authStore.isValid) {
        const userData = pb.authStore.model

        for (let key in userData) {
            if (key.includes("webauthn")) {
                delete userData[key];
            }
        }

        delete userData["masterPasswordHash"]

        res.json({
            state: 'success',
            token: pb.authStore.token,
            userData
        });

    } else {
        res.status(401).send({
            state: 'error',
            message: 'Invalid credentials',
        });
    }
}));

router.post("/auth/verify", asyncWrapper(async (req, res) => {
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const pb = new Pocketbase(process.env.PB_HOST);

    pb.authStore.save(bearerToken, null);
    await pb.collection('users').authRefresh();

    if (pb.authStore.isValid) {
        const userData = pb.authStore.model

        for (let key in userData) {
            if (key.includes("webauthn")) {
                delete userData[key];
            }
        }

        delete userData["masterPasswordHash"]
        res.json({
            state: 'success',
            token: pb.authStore.token,
            userData
        });

    }
}));

router.patch('/module', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id, data } = req.body;
    await pb.collection('users').update(id, {
        enabledModules: data,
    });

    success(res)
}));

router.patch('/personalization', asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id, data } = req.body;
    await pb.collection('users').update(id, data);

    success(res)
}));

export default router;
