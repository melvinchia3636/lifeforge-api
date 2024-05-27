import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import _ from 'underscore';
import express from 'express';
import { success } from '../../utils/response.js';
import asyncWrapper from '../../utils/asyncWrapper.js';

const router = express.Router();

const config = {
    imap: {
        user: 'melvinchia623600@gmail.com',
        password: 'yrwe noro hdms ffdz',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
        tlsOptions: { rejectUnauthorized: false }
    }
};

router.get('/list', asyncWrapper(async (req, res) => {
    imaps.connect(config).then(connection => {
        return connection.openBox('INBOX').then(() => {
            const searchCriteria = [
                'UNSEEN',
            ];
    
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
                markSeen: false
            };
    
            return connection.search(searchCriteria, fetchOptions);
        }).then(messages => {
            const cleanedUpMessages = messages.map(message => {
                const all = _.find(message.parts, { "which": "" });
                const id = message.attributes.uid;
                const idHeader = "Imap-Id: " + id + "\r\n";
                
                simpleParser(idHeader + all.body, (err, mail) => {
                    if (err) {
                        return {};
                    } else {
                        return {
                            from: mail.from.text,
                            date: mail.date,
                            subject: mail.subject,
                            text: mail.text
                        };
                    }
                });
            });

            success(res, cleanedUpMessages);
    
            connection.end();
        }).catch(err => {
            res.status(500).json({
                state: 'error',
                message: err.message
            })
        });
    }).catch(err => {
        res.status(500).json({
            state: 'error',
            message: err.message
        });
    });
}))

export default router;