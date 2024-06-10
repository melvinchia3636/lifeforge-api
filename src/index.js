import express from 'express'
import router from './app.js'

const app = express()
app.set('view engine', 'ejs')

app.use('/', router)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})
