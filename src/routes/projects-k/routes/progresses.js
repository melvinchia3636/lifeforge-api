import express from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'

const router = express.Router()

router.get(
    '/list-steps',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const steps = await pb
            .collection('projects_k_progress_step')
            .getFullList()

        success(res, steps)
    })
)

router.get(
    '/get/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        let project = await pb
            .collection('projects_k_entries')
            .getOne(req.params.id, {
                expand: 'progress.steps'
            })

        project = project.expand.progress

        project.expand.steps.forEach(steps => {
            steps.forEeach(key => {
                if (!['name', 'icon', 'id'].includes(key)) {
                    delete steps[key]
                }
            })
        })

        project.expand.steps = Object.fromEntries(
            project.expand.steps.map(step => [
                step.id,
                { name: step.name, icon: step.icon }
            ])
        )

        success(res, project)
    })
)

router.patch(
    '/complete-step/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const project = await pb
            .collection('projects_k_entries')
            .getOne(req.params.id, {
                expand: 'progress.steps'
            })
        const progressRecord = project.expand.progress

        await pb.collection('projects_k_progress').update(progressRecord.id, {
            'completed+': 1
        })

        success(res)
    })
)

router.patch(
    '/uncomplete-step/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const project = await pb
            .collection('projects_k_entries')
            .getOne(req.params.id, {
                expand: 'progress.steps'
            })
        const progressRecord = project.expand.progress

        await pb.collection('projects_k_progress').update(progressRecord.id, {
            'completed-': 1
        })

        success(res)
    })
)

export default router
