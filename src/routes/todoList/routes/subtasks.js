import { GoogleGenerativeAI } from '@google/generative-ai'
import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'

const router = express.Router()

const BREAKDOWN_LEVELS = [
    'Very Brief - High-level steps, only the main tasks',
    'Somewhat detailed - More steps, but still broad',
    'Detailed - Includes most steps, clear and comprehensive',
    'Very detailed - Thorough, covers almost every step',
    'Exhaustive - Every single step, extremely detailed'
]

router.get(
    '/list/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const entries = await pb.collection('todo_entries').getOne(id, {
            expand: 'subtasks'
        })

        success(res, entries.expand ? entries.expand.subtasks : [])
    })
)

router.post(
    '/ai-generate',
    asyncWrapper(async (req, res) => {
        const { summary, notes, level } = req.body

        if (!summary.trim()) {
            clientError(res, 'summary is required')
            return
        }

        if (![0, 1, 2, 3, 4].includes(level)) {
            clientError(
                res,
                'level is required and must be one of: 0, 1, 2, 3, 4'
            )
            return
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash'
        })

        const prompt = `Generate a detailed list of subtasks for completing the following task: "${summary.trim()}".${notes.trim() ? `Also, take into consideration that there is notes to the task being "${notes.trim()}".` : ''} The list should be organized in a logical sequence. The level of breakdown should be ${BREAKDOWN_LEVELS[level]
            }. The amount and the level of details of subtasks generated should correspond to the breakdown level. Ensure the output is in the form of a single-level flat JavaScript array, with each element containing only the task content, written in the same language as the given task, and without any additional details, comments, explanations, or nested subtasks or details of the subtask. Make sure not to wrap the output array in any code environment, and the output array should be plain text that can be parsed by javascript JSON.parse() function.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = JSON.parse(response.text())

        success(res, text)
    })
)

router.patch(
    '/toggle/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const entries = await pb.collection('todo_subtask').getOne(id)

        await pb.collection('todo_subtask').update(id, {
            done: !entries.done
        })

        success(res)
    })
)

export default router
