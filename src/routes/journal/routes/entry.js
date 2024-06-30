import express from 'express'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import validate from '../../../common/validate.js'
import { decrypt, decrypt2 } from '../../../utils/encryption.js'
import { challenge } from '../index.js'
import bcrypt from 'bcrypt'
import Groq from 'groq-sdk'

const router = express.Router()

router.get(
    '/get/:id',
    asyncWrapper(async (req, res) => {
        const { id } = req.params
        const { pb } = req
        let master = decodeURIComponent(req.query.master || '')

        if (!master) {
            clientError(res, 'master is required')
            return
        }

        const { journalMasterPasswordHash } = pb.authStore.model

        const decryptedMaster = decrypt2(master, challenge)

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            journalMasterPasswordHash
        )

        if (!isMatch) {
            clientError(res, 'Invalid master password')
            return
        }

        const entry = await pb.collection('journal_entry').getOne(id)

        const decryptedContent = decrypt(
            Buffer.from(entry.content, 'base64'),
            decryptedMaster
        )

        const decryptedSummary = decrypt(
            Buffer.from(entry.summary, 'base64'),
            decryptedMaster
        )

        const decryptedRaw = decrypt(
            Buffer.from(entry.raw, 'base64'),
            decryptedMaster
        )

        entry.content = decryptedContent.toString()
        entry.summary = decryptedSummary.toString()
        entry.raw = decryptedRaw.toString()

        success(res, entry)
    })
)

router.get('/valid/:id', validate('journal_entry'))

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        let master = decodeURIComponent(req.query.master || '')

        if (!master) {
            clientError(res, 'master is required')
            return
        }

        const { journalMasterPasswordHash } = pb.authStore.model

        const decryptedMaster = decrypt2(master, challenge)

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            journalMasterPasswordHash
        )

        if (!isMatch) {
            clientError(res, 'Invalid master password')
            return
        }

        const journals = await pb.collection('journal_entry').getFullList({
            sort: '-created'
        })

        for (const journal of journals) {
            const decryptedSummary = decrypt(
                Buffer.from(journal.summary, 'base64'),
                decryptedMaster
            )

            journal.content = decryptedSummary.toString()

            delete journal.summary
            delete journal.raw
        }

        success(res, journals)
    })
)

router.post(
    '/create',
    [body('title').notEmpty(), body('content').notEmpty()],
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { title, content } = req.body

        const entry = await pb.collection('journal_entry').create({
            title,
            content
        })

        success(res, entry)
    })
)

router.patch(
    '/update-title/:id',
    body('title').notEmpty(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { id } = req.params
        const { pb } = req
        const { title } = req.body

        await pb.collection('journal_entry').update(id, {
            title
        })

        success(res, 'Title updated')
    })
)

router.put(
    '/update-content/:id',
    body('content').notEmpty(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { id } = req.params
        const { pb } = req
        const { content } = req.body

        await pb.collection('journal_entry').update(id, {
            content
        })

        success(res, 'Content updated')
    })
)

router.delete(
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        const { id } = req.params
        const { pb } = req

        await pb.collection('journal_entry').delete(id)

        success(res, 'Entry deleted')
    })
)

router.post(
    '/cleanup',
    asyncWrapper(async (req, res) => {
        const { text, master } = req.body
        const { pb } = req

        if (!text || !master) {
            clientError(res, 'text and master are required')
            return
        }

        const { journalMasterPasswordHash } = pb.authStore.model

        const decryptedMaster = decrypt2(master, challenge)

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            journalMasterPasswordHash
        )

        if (!isMatch) {
            clientError(res, 'Invalid master password')
            return
        }

        const rawText = decrypt2(text, decryptedMaster)

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        })

        const prompt = `This text is a diary entry. Translate it into grammatically correct and well-punctuated English, maintaining a natural flow with proper paragraph breaks. The diary content should be all normal paragraphs WITHOUT any headings or titles. Focus solely on the diary content itself. Omit any text like "Here is the...", headings like "Diary Entry", or closing remarks.
        
        ${rawText}
        `

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama3-70b-8192'
        })

        const cleanedup = response.choices[0]?.message?.content

        success(res, cleanedup)
    })
)

router.post(
    '/summarize',
    asyncWrapper(async (req, res) => {
        const { text, master } = req.body
        const { pb } = req

        if (!text || !master) {
            clientError(res, 'text and master are required')
            return
        }

        const { journalMasterPasswordHash } = pb.authStore.model

        const decryptedMaster = decrypt2(master, challenge)

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            journalMasterPasswordHash
        )

        if (!isMatch) {
            clientError(res, 'Invalid master password')
            return
        }

        const rawText = decrypt2(text, decryptedMaster)

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        })

        const prompt = `Below is a diary entry. Summarize the diary in first person perspective into a single paragraph, not more than three sentences and 50 words, capturing the main idea and key details. All the pronounces should be "I". The response should be just the summarized paragraph itself. Omit any greetings like "Here is the...", headings like "Diary Entry", or closing remarks.
        
        ${rawText}
        `

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama3-70b-8192'
        })

        const summarized = response.choices[0]?.message?.content

        success(res, summarized)
    })
)

router.post(
    '/mood/',
    asyncWrapper(async (req, res) => {
        const { text, master } = req.body
        const { pb } = req

        if (!text || !master) {
            clientError(res, 'text and master are required')
            return
        }

        const { journalMasterPasswordHash } = pb.authStore.model

        const decryptedMaster = decrypt2(master, challenge)

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            journalMasterPasswordHash
        )

        if (!isMatch) {
            clientError(res, 'Invalid master password')
            return
        }

        const rawText = decrypt2(text, decryptedMaster)

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        })

        const prompt = `Below is a diary entry. Use a word to describe the mood of the author, and give a suitable unicode emoji icon for the mood. The word should be in full lowercase, and do not use the word "reflective". The emoji icon should be those in the emoji keyboard of modern phone. The response should be a JSON object, with the key being "text" and "emoji". Make sure to wrap the emoji icon in double quote. Do not wrap the JSON in a markdown code environment, and make sure that the response can be parsed straightaway by javascript's JSON.parse() function.
        
        ${rawText}
        `

        const MAX_RETRY = 5
        let tries = 0

        while (tries < MAX_RETRY) {
            try {
                const response = await groq.chat.completions.create({
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: 'llama3-70b-8192'
                })

                const mood = JSON.parse(response.choices[0]?.message?.content)

                success(res, mood)

                break
            } catch {
                tries++
            }
        }
    })
)

export default router
