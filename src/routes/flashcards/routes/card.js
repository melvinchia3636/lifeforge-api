import express from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'

const router = express.Router()

router.get(
    '/list/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const entries = await pb.collection('flashcards_card').getFullList({
            filter: `deck='${id}'`
        })

        success(res, entries)
    })
)

router.put(
    '/update',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { deck, cards, toBeDeletedId } = req.body

        for (const card of toBeDeletedId) {
            await pb.collection('flashcards_card').delete(card)
        }

        for (const card of cards) {
            switch (card.type) {
                case 'update':
                    if (card.id) {
                        await pb.collection('flashcards_card').update(card.id, {
                            question: card.question,
                            answer: card.answer
                        })
                    } else {
                        await pb.collection('flashcards_card').create({
                            deck,
                            question: card.question,
                            answer: card.answer
                        })
                    }
                    break
                case 'create':
                    await pb.collection('flashcards_card').create({
                        deck,
                        question: card.question,
                        answer: card.answer
                    })
                    break
                default:
                    break
            }
        }

        const { totalItems } = await pb
            .collection('flashcards_card')
            .getList(1, 1, {
                filter: `deck='${deck}'`
            })

        await pb.collection('flashcards_deck').update(deck, {
            card_amount: totalItems
        })

        success(res)
    })
)

export default router
