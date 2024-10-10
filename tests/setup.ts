import { beforeAll } from 'vitest'
import dotenv from 'dotenv'

dotenv.config({
    path: '.env.local'
})

beforeAll(async () => {
    const requiredEnvVars = [
        'MASTER_KEY',
        'PB_HOST',
        'PB_EMAIL',
        'PB_PASSWORD',
        'DATABASE_OWNER',
        'PORT'
    ]

    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            console.error(`Missing environment variable: ${envVar}`)
            process.exit(1)
        }
    })

    try {
        const res = await fetch('http://localhost:3636/status')
        if (res.status !== 200) {
            throw new Error('Server is not running')
        }
    } catch {
        console.error('Server is not running')
        process.exit(1)
    }
})
