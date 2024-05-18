/* eslint-disable new-cap */
/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable no-multi-str */
import express from 'express';
import request from 'request';
import asyncWrapper from '../../utils/asyncWrapper.js';

const router = express.Router();

function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

router.get('/auth/login', asyncWrapper(async (req, res) => {
    const scope = 'streaming \
    user-read-playback-state \
    user-modify-playback-state \
    user-read-currently-playing \
    user-read-email \
    user-read-private \
    playlist-read-private \
    playlist-read-collaborative \
    playlist-modify-private \
    playlist-modify-public \
    user-follow-modify \
    user-follow-read \
    user-read-playback-position \
    user-top-read \
    user-read-recently-played \
    user-library-modify \
    user-library-read\
    ';

    const state = generateRandomString(16);

    const auth_query_parameters = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope,
        redirect_uri: 'https://lifeforge-api-proxy.onrender.com/spotify/auth/callback',
        state,
    });

    res.redirect(`https://accounts.spotify.com/authorize/?${auth_query_parameters.toString()}`);
}));

router.get('/auth/callback', asyncWrapper(async (req, res) => {
    const { code } = req.query;
    const { pb } = req;

    await pb.admins.authWithPassword(
        process.env.PB_EMAIL,
        process.env.PB_PASSWORD,
    );

    const user = await pb.collection('users').getFirstListItem(`email = "${pb.authStore.model.email}"`);
    const userId = user.id;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code,
            redirect_uri: 'https://lifeforge-api-proxy.onrender.com/spotify/auth/callback',
            grant_type: 'authorization_code',
        },
        headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        json: true,
    };

    request.post(authOptions, async (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const { access_token } = body;
            const { refresh_token } = body;

            await pb.collection('users').update(userId, {
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token,
                spotifyTokenExpires: new Date(Date.now() + (body.expires_in * 1000)).toISOString(),
            });
            res.redirect('http://localhost:5173/spotify');
            return;
        }
        res.status(401).send({
            state: 'error',
            message: 'Unauthorized',
        });
    });
}));

router.get('/auth/refresh', asyncWrapper(async (req, res) => {
    const { pb } = req;

    await pb.admins.authWithPassword(
        process.env.PB_EMAIL,
        process.env.PB_PASSWORD,
    );

    const user = await pb.collection('users').getFirstListItem(`email = "${pb.authStore.model.email}"`);
    const userId = user.id;
    const { spotifyRefreshToken: refresh_token } = user;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${new Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token,
        },
        json: true,
    };

    request.post(authOptions, async (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const { access_token } = body;
            const { refresh_token } = body;

            await pb.collection('users').update(userId, {
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token,
                spotifyTokenExpires: new Date(Date.now() + (body.expires_in * 1000)).toISOString(),
            });

            res.send({
                state: 'success',
                access_token,
            });
        }
    });
}));

export default router;
