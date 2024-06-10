import express from 'express'
import asyncWrapper from '../../utils/asyncWrapper.js'
import { success } from '../../utils/response.js'

const router = express.Router()

router.get(
    '/repo/list',
    asyncWrapper(async (req, res) => {
        const repos = await fetch(
            `http://192.168.0.117:3000/api/v1/users/${process.env.GITEA_USERNAME}/repos`,
            {
                headers: {
                    Authorization: `token ${process.env.GITEA_TOKEN}`
                }
            }
        )
            .then(response => response.json())
            .catch(error => {
                throw error
            })

        const results = []

        for (const repo of repos) {
            results.push({
                archived: repo.archived,
                created_at: repo.created_at,
                default_branch: repo.default_branch,
                description: repo.description,
                full_name: repo.full_name,
                id: repo.id,
                language: repo.language,
                name: repo.name,
                open_issues_count: repo.open_issues_count,
                owner: repo.owner,
                size: repo.size,
                updated_at: repo.updated_at
            })
        }

        success(res, results)
    })
)

export default router
