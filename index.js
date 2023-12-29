const express = require("express")
const cors = require("cors")
const { exec } = require("child_process")
const Pocketbase = require('pocketbase/cjs');

const app = express()

const initPB = async (req, res, next) => {
    const pb = new Pocketbase(process.env.PB_HOST)
    try {
        await pb.admins.authWithPassword(process.env.PB_EMAIL, process.env.PB_PASSWORD)
        req.pb = pb
        next()
    } catch (error) {
        console.log(error)
        res.status(401).send("Unauthorized")
    }
}

app.use(cors())
app.use(express.json())
app.use(initPB)

app.get("/books/list", (req, res) => {
    const { stdout, stderr } = exec("/Applications/calibre.app/Contents/MacOS/calibredb list --for-machine", (err, stdout, stderr) => {
        if (err) {
            console.log(err)
            return
        }
        res.json(JSON.parse(stdout))
    })
})

app.get("/idea-box/container/list", async (req, res) => {
    const { pb } = req
    const containers = await pb.collection("idea_box_container").getFullList()
    res.json(containers)
})

app.listen(3636, () => {
    console.log("Server is running on port 3636")
})