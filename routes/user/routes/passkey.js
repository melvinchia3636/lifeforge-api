import express from 'express';
import * as webauthn from '@passwordless-id/webauthn';

const router = express.Router();

let challenge = webauthn.utils.randomChallenge();

setTimeout(() => {
    challenge = webauthn.utils.randomChallenge();
}, 1000 * 60 * 60 * 24);

router.get('/challenge', async (req, res) => {
    try {
        res.json({
            state: 'success',
            data: challenge,
        });
    } catch (e) {
        res.status(500).json({
            state: 'error',
            message: e.message,
        });
    }
});

router.post('/register', async (req, res) => {
    try {
        const {
            username, credential: {
                id, publicKey, algorithm,
            },
        } = req.body;

        const { pb } = req;

        await pb.admins.authWithPassword(
            process.env.PB_EMAIL,
            process.env.PB_PASSWORD,
        );

        const user = await pb.collection('users').getFirstListItem(`email = "${username}"`);

        if (!user) {
            res.status(404).json({
                state: 'error',
                message: 'User not found',
            });

            return;
        }

        await pb.collection('users').update(user.id, {
            webauthnCredentialId: id,
            webauthnPublicKey: publicKey,
            webauthnAlgorithm: algorithm,
        });

        res.json({
            state: 'success',
            data: 'register',
        });
    } catch (e) {
        res.status(500).json({
            state: 'error',
            message: e.message,
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const data = req.body;

        const { pb } = req;

        await pb.admins.authWithPassword(
            process.env.PB_EMAIL,
            process.env.PB_PASSWORD,
        );

        const user = await pb.collection('users').getFirstListItem(`webauthnCredentialId = "${data.credentialId}"`);

        if (!user) {
            res.status(404).json({
                state: 'error',
                message: 'User not found',
            });
        }

        const { webauthnPublicKey, webauthnAlgorithm } = user;

        const credentialKey = {
            id: data.credentialId,
            publicKey: webauthnPublicKey,
            algorithm: webauthnAlgorithm,
        };

        const expected = {
            challenge,
            origin: 'http://localhost:5173',
            userVerified: true,
            counter: -1,
        };

        const verified = await webauthn.server.verifyAuthentication(data, credentialKey, expected);

        if (verified.authenticator.flags.userVerified) {
            const { token } = await fetch(`${process.env.PB_HOST}/auth/get-token/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${pb.authStore.token}`,
                },
            }).then((res) => res.json());

            res.json({
                state: 'success',
                token,
            });
        } else {
            res.status(401).json({
                state: 'error',
                message: 'User not verified',
            });
        }
    } catch (e) {
        res.status(500).json({
            state: 'error',
            message: e.message,
        });
    }
});

export default router;
