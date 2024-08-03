import express, { Request, Response } from 'express'
import { successWithBaseResponse } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { list } from '../../../utils/CRUD.js'

const router = express.Router()

router.get(
    '/list/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { id } = req.params
        list(req, res, 'flashcards_cards', {
            filter: `deck='${id}'`
        })
    })
)

router.put(
    '/update',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { deck, cards, toBeDeletedId } = req.body

        for (const card of toBeDeletedId) {
            await pb.collection('flashcards_cards').delete(card)
        }

        for (const card of cards) {
            switch (card.type) {
                case 'update':
                    if (card.id) {
                        await pb
                            .collection('flashcards_cards')
                            .update(card.id, {
                                question: card.question,
                                answer: card.answer
                            })
                    } else {
                        await pb.collection('flashcards_cards').create({
                            deck,
                            question: card.question,
                            answer: card.answer
                        })
                    }
                    break
                case 'create':
                    await pb.collection('flashcards_cards').create({
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
            .collection('flashcards_cards')
            .getList(1, 1, {
                filter: `deck='${deck}'`
            })

        await pb.collection('flashcards_decks').update(deck, {
            card_amount: totalItems
        })

        successWithBaseResponse(res)
    })
)

export default router
