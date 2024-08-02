import express, { Request, Response } from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { validate } from '../../../utils/CRUD.js'

const router = express.Router()

router.get(
    '/get/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const project = await pb
            .collection('projects_k_entries')
            .getOne(req.params.id)
        success(res, project)
    })
)

router.get(
    '/valid/:id',
    asyncWrapper(async (req: Request, res: Response) =>
        validate(req, res, 'projects_k_entries')
    )
)

router.get(
    '/list',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const projects = await pb.collection('projects_k_entries').getFullList({
            expand: 'progress,payment_status'
        })

        projects.forEach((project: any) => {
            project.progress = project.expand.progress
            project.payment_status = project.expand.payment_status
            delete project.expand
        })

        success(res, projects)
    })
)

router.post(
    '/create',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const {
            name,
            customerName,
            visibility,
            status,
            totalPayable,
            deposit,
            steps
        } = req.body

        if (!name || !steps || !status || !visibility) {
            return res.status(400).send({
                state: 'error',
                message: 'Missing required fields'
            })
        }

        if (visibility === 'commercial') {
            if (!customerName || !totalPayable || !deposit) {
                return res.status(400).send({
                    state: 'error',
                    message: 'Missing required fields'
                })
            }

            if (totalPayable < deposit) {
                return res.status(400).send({
                    state: 'error',
                    message: 'Deposit cannot be greater than total payable'
                })
            }
        }

        const paymentStatusRecord =
            visibility === 'commercial'
                ? await pb.collection('projects_k_payment_status').create({
                      total_amt: totalPayable,
                      deposit_amt: deposit,
                      deposit_paid: false,
                      fully_paid: false
                  })
                : undefined

        const progressRecord = await pb
            .collection('projects_k_progress')
            .create({
                steps,
                completed: 0
            })

        const project = await pb.collection('projects_k_entries').create({
            name,
            customer_name:
                visibility === 'commercial' ? customerName : undefined,
            type: visibility,
            status,
            payment_status: paymentStatusRecord
                ? paymentStatusRecord.id
                : undefined,
            progress: progressRecord.id
        })

        success(res, project)
    })
)

router.patch(
    '/update-status/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { status } = req.body

        if (!status) {
            return res.status(400).send({
                state: 'error',
                message: 'Missing required fields'
            })
        }

        const project = await pb
            .collection('projects_k_entries')
            .update(req.params.id, {
                status
            })

        success(res, project)
    })
)

export default router
