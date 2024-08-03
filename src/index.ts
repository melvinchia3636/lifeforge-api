import express from 'express'
import dotenv from 'dotenv'
import router from './app.js'

dotenv.config({
    path: '.env.local'
})

const app = express()
app.disable('x-powered-by')
app.set('view engine', 'ejs')

app.use('/', router)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})
