/* eslint-disable indent */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const express = require('express');

const router = express.Router();

router.get('/list/:id', async (req, res) => {
    try {
        const { pb } = req;
        const { id } = req.params;
        const entries = await pb.collection('flashcards_card').getFullList({
            filter: `deck='${id}'`,
        });

        res.json({
            state: 'success',
            data: entries,
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

router.put('/update', async (req, res) => {
    try {
        const { pb } = req;
        const { deck, cards, toBeDeletedId } = req.body;

        for (const card of toBeDeletedId) {
            await pb.collection('flashcards_card').delete(card);
        }

        for (const card of cards) {
            switch (card.type) {
                case 'update':
                    if (card.id) {
                        await pb.collection('flashcards_card').update(card.id, {
                            question: card.question,
                            answer: card.answer,
                        });
                    } else {
                        await pb.collection('flashcards_card').create({
                            deck,
                            question: card.question,
                            answer: card.answer,
                        });
                    }
                    break;
                case 'create':
                    await pb.collection('flashcards_card').create({
                        deck,
                        question: card.question,
                        answer: card.answer,
                    });
                    break;
                default: break;
            }
        }

        const { totalItems } = await pb.collection('flashcards_card').getList(1, 1, {
            filter: `deck='${deck}'`,
        });

        await pb.collection('flashcards_deck').update(deck, {
            card_amount: totalItems,
        });

        res.json({
            state: 'success',
            message: 'Card updated successfully',
        });
    } catch (error) {
        res.status(500).json({
            state: 'error',
            message: error.message,
        });
    }
});

module.exports = router;
