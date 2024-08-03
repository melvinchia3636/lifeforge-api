import express, { Request, Response } from 'express'
import {
    clientError,
    successWithBaseResponse
} from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { decrypt, decrypt2, encrypt } from '../../../utils/encryption.js'
import { challenge } from '../index.js'
import bcrypt from 'bcrypt'
import Groq from 'groq-sdk'
import { uploadMiddleware } from '../../../middleware/uploadMiddleware.js'
import fs from 'fs'
import moment from 'moment/moment.js'
import { validate } from '../../../utils/CRUD.js'
import { body, query } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { IJournalEntry } from '../../../interfaces/journal_interfaces.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { WithoutPBDefault } from '../../../interfaces/pocketbase_interfaces.js'

const router = express.Router()

async function checkMasterPassword(
    master: string,
    journalMasterPasswordHash: string
): Promise<[boolean, string]> {
    const decryptedMaster = decrypt2(master, challenge)

    const isMatch = await bcrypt.compare(
        decryptedMaster,
        journalMasterPasswordHash
    )

    return [isMatch, decryptedMaster]
}

async function getDecryptedMaster(
    req: Request,
    res: Response
): Promise<string | null> {
    const { pb } = req
    const { master } = req.body

    if (!pb.authStore.model) {
        clientError(res, 'authStore is not initialized')
        return null
    }

    const { journalMasterPasswordHash } = pb.authStore.model

    const [isMatched, decryptedMaster] = await checkMasterPassword(
        master,
        journalMasterPasswordHash
    )

    if (!isMatched) {
        clientError(res, 'Invalid master password')
        return null
    }

    return decryptedMaster
}

router.get(
    '/get/:id',
    [query('master').exists().notEmpty()],
    asyncWrapper(
        async (
            req: Request<
                { id: string },
                {},
                {},
                {
                    master: string
                }
            >,
            res: Response<BaseResponse<IJournalEntry>>
        ) => {
            if (hasError(req, res)) return

            const { id } = req.params
            const { pb } = req
            let master = decodeURIComponent(req.query.master || '')

            if (pb.authStore.model === null) {
                clientError(res, 'authStore is not initialized')
                return
            }

            const { journalMasterPasswordHash } = pb.authStore.model
            const [isMatched, decryptedMaster] = await checkMasterPassword(
                master,
                journalMasterPasswordHash
            )

            if (!isMatched) {
                clientError(res, 'Invalid master password')
                return
            }

            const entries: IJournalEntry = await pb
                .collection('journal_entries')
                .getOne(id)

            for (const item of [
                'title',
                'content',
                'summary',
                'raw'
            ] as (keyof Pick<
                IJournalEntry,
                'title' | 'content' | 'summary' | 'raw'
            >)[]) {
                entries[item] = decrypt(
                    Buffer.from(entries[item] ?? '', 'base64'),
                    decryptedMaster
                ).toString()
            }

            entries.token = await pb.files.getToken()

            successWithBaseResponse(res, entries)
        }
    )
)

router.get(
    '/valid/:id',
    asyncWrapper(async (req: Request, res: Response<boolean>) =>
        validate(req, res, 'journal_entries')
    )
)

router.get(
    '/list',
    [query('master').exists().notEmpty()],
    asyncWrapper(
        async (
            req: Request<{}, {}, {}, { master: string }>,
            res: Response<BaseResponse<IJournalEntry[]>>
        ) => {
            if (hasError(req, res)) return

            const { pb } = req
            let master = decodeURIComponent(req.query.master || '')

            if (pb.authStore.model === null) {
                clientError(res, 'authStore is not initialized')
                return
            }

            const { journalMasterPasswordHash } = pb.authStore.model

            const [isMatched, decryptedMaster] = await checkMasterPassword(
                master,
                journalMasterPasswordHash
            )

            if (!isMatched) {
                clientError(res, 'Invalid master password')
                return
            }

            const journals: IJournalEntry[] = await pb
                .collection('journal_entries')
                .getFullList({
                    sort: '-created'
                })

            for (const journal of journals) {
                journal.title = decrypt(
                    Buffer.from(journal.title, 'base64'),
                    decryptedMaster
                ).toString()

                journal.content = decrypt(
                    Buffer.from(journal.summary ?? '', 'base64'),
                    decryptedMaster
                ).toString()

                delete journal.summary
                delete journal.raw
            }

            successWithBaseResponse(res, journals)
        }
    )
)

router.post(
    '/create',
    uploadMiddleware,
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IJournalEntry>>) => {
            const { pb } = req
            const { data } = req.body
            const files = req.files as Express.Multer.File[]

            if (!pb.authStore.model) {
                clientError(res, 'authStore is not initialized')

                for (const file of files) {
                    fs.unlinkSync(file.path)
                }

                return
            }

            const { journalMasterPasswordHash } = pb.authStore.model

            if (!data) {
                clientError(res, 'data is required')

                for (const file of files) {
                    fs.unlinkSync(file.path)
                }

                return
            }

            let { title, date, raw, cleanedUp, summarized, mood, master } =
                JSON.parse(decrypt2(data, challenge))

            master = decrypt2(master, challenge)
            const isMatch = await bcrypt.compare(
                master,
                journalMasterPasswordHash
            )

            if (!isMatch) {
                clientError(res, 'Invalid master password')

                for (const file of files) {
                    fs.unlinkSync(file.path)
                }

                return
            }

            title = decrypt2(title, master)
            raw = decrypt2(raw, master)
            cleanedUp = decrypt2(cleanedUp, master)
            summarized = decrypt2(summarized, master)
            mood = JSON.parse(decrypt2(mood, master))

            const newEntry: Omit<WithoutPBDefault<IJournalEntry>, 'photos'> & {
                photos: File[]
            } = {
                date,
                title: encrypt(Buffer.from(title), master).toString('base64'),
                raw: encrypt(Buffer.from(raw), master).toString('base64'),
                content: encrypt(Buffer.from(cleanedUp), master).toString(
                    'base64'
                ),
                summary: encrypt(Buffer.from(summarized), master).toString(
                    'base64'
                ),
                mood,
                photos: files.map(
                    file =>
                        new File(
                            [fs.readFileSync(file.path)],
                            file.originalname
                        )
                )
            }

            const entry: IJournalEntry = await pb
                .collection('journal_entries')
                .create(newEntry)

            for (const file of files) {
                fs.unlinkSync(file.path)
            }

            successWithBaseResponse(res, entry)
        }
    )
)

router.put(
    '/update/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IJournalEntry>>) => {
            const { id } = req.params
            const { pb } = req
            const { data } = req.body

            if (!pb.authStore.model) {
                clientError(res, 'authStore is not initialized')
                return
            }

            const { journalMasterPasswordHash } = pb.authStore.model

            if (!data) {
                clientError(res, 'data is required')
                return
            }

            let { title, date, raw, cleanedUp, summarized, mood, master } =
                JSON.parse(decrypt2(data, challenge))

            master = decrypt2(master, challenge)
            const isMatch = await bcrypt.compare(
                master,
                journalMasterPasswordHash
            )

            if (!isMatch) {
                clientError(res, 'Invalid master password')

                return
            }

            title = decrypt2(title, master)
            raw = decrypt2(raw, master)
            cleanedUp = decrypt2(cleanedUp, master)
            summarized = decrypt2(summarized, master)
            mood = JSON.parse(decrypt2(mood, master))

            const updatedEntry: Omit<
                WithoutPBDefault<IJournalEntry>,
                'photos'
            > = {
                date: moment(date).format('YYYY-MM-DD'),
                title: encrypt(Buffer.from(title), master).toString('base64'),
                raw: encrypt(Buffer.from(raw), master).toString('base64'),
                content: encrypt(Buffer.from(cleanedUp), master).toString(
                    'base64'
                ),
                summary: encrypt(Buffer.from(summarized), master).toString(
                    'base64'
                ),
                mood
            }

            const entry: IJournalEntry = await pb
                .collection('journal_entries')
                .update(id, updatedEntry)

            successWithBaseResponse(res, entry)
        }
    )
)

router.delete(
    '/delete/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { id } = req.params
        const { pb } = req

        await pb.collection('journal_entries').delete(id)

        successWithBaseResponse(res, 'entries deleted')
    })
)

router.post(
    '/ai/title',
    [body('text').exists().notEmpty(), body('master').exists().notEmpty()],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { text } = req.body

        const decryptedMaster = await getDecryptedMaster(req, res)
        if (!decryptedMaster) return

        const rawText = decrypt2(text, decryptedMaster)

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        })

        const prompt = `This text is a journal entries. Please give me a suitable title for this journal, highlighting the stuff that happended that day. The title should not be longer than 10 words. Give the title in title case, which means the first letter of each word should be in uppercase, and lowercase otherwise. The response should contains ONLY the title, without any other unrelated text, especially those that are in the beginning of the response, like "Here is the..." or "The title is...".
        
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

        const title = response.choices[0]?.message?.content

        successWithBaseResponse(res, title)
    })
)

router.post(
    '/ai/cleanup',
    [body('text').exists().notEmpty(), body('master').exists().notEmpty()],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { text } = req.body

        const decryptedMaster = await getDecryptedMaster(req, res)
        if (!decryptedMaster) return

        const rawText = decrypt2(text, decryptedMaster)

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        })

        const prompt = `This text is a diary entries. Translate it into grammatically correct and well-punctuated English, maintaining a natural flow with proper paragraph breaks. The diary content should be all normal paragraphs WITHOUT any headings or titles. Focus solely on the diary content itself. Omit any text like "Here is the...", headings like "Diary entries", or closing remarks.
        
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

        successWithBaseResponse(res, cleanedup)
    })
)

router.post(
    '/ai/summarize',
    [body('text').exists().notEmpty(), body('master').exists().notEmpty()],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { text } = req.body

        const decryptedMaster = await getDecryptedMaster(req, res)
        if (!decryptedMaster) return

        const rawText = decrypt2(text, decryptedMaster)

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        })

        const prompt = `Below is a diary entries. Summarize the diary in first person perspective into a single paragraph, not more than three sentences and 50 words, capturing the main idea and key details. All the pronounces should be "I". The response should be just the summarized paragraph itself. Omit any greetings like "Here is the...", headings like "Diary entries", or closing remarks.
        
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

        successWithBaseResponse(res, summarized)
    })
)

router.post(
    '/ai/mood/',
    [body('text').exists().notEmpty(), body('master').exists().notEmpty()],
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IJournalEntry['mood']>>
        ) => {
            if (hasError(req, res)) return

            const { text } = req.body

            const decryptedMaster = await getDecryptedMaster(req, res)
            if (!decryptedMaster) return

            const rawText = decrypt2(text, decryptedMaster)

            const groq = new Groq({
                apiKey: process.env.GROQ_API_KEY
            })

            const prompt = `Below is a diary entries. Use a word to describe the mood of the author, and give a suitable unicode emoji icon for the mood. The word should be in full lowercase, and do not use the word "reflective". The emoji icon should be those in the emoji keyboard of modern phone. The response should be a JSON object, with the key being "text" and "emoji". Make sure to wrap the emoji icon in double quote. Do not wrap the JSON in a markdown code environment, and make sure that the response can be parsed straightaway by javascript's JSON.parse() function.
        
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

                    const mood: IJournalEntry['mood'] = JSON.parse(
                        response.choices[0]?.message?.content ?? '{}'
                    )

                    successWithBaseResponse(res, mood)

                    break
                } catch {
                    tries++
                }
            }
        }
    )
)

export default router
