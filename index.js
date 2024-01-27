const express = require("express")
const cors = require("cors")
const { exec } = require("child_process")
const Pocketbase = require('pocketbase/cjs');
const all_routes = require('express-list-endpoints');

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

const app = express()
app.set('view engine', 'ejs');
app.use(cors())
app.use(express.json())
app.use(initPB)

app.use('/user', require("./routes/user"))
app.use("/idea-box", require("./routes/ideaBox"))
app.use("/code-snippets", require("./routes/codeSnippets"))
app.use("/code-time", require("./routes/codeTime"))
app.use("/notes", require("./routes/notes"))
app.use("/change-log", require("./routes/changeLog"))

app.get("/books/list", (req, res) => {
    const { stdout, stderr } = exec("/Applications/calibre.app/Contents/MacOS/calibredb list --for-machine", (err, stdout, stderr) => {
        if (err) {
            console.log(err)
            return
        }
        res.json(JSON.parse(stdout))
    })
})

app.get("/", (req, res) => {
    const routes = all_routes(app).flatMap(route => route.methods.map(method => ({
        path: route.path,
        method: method
    }))).reduce((acc, route) => {
        if (acc[route.path.split("/")[1]]) {
            acc[route.path.split("/")[1]].push(route)
        } else {
            acc[route.path.split("/")[1]] = [route]
        }
        return acc
    }, {})

    res.render("api-explorer", {
        routes
    })
})


app.listen(3636, () => {
    console.log("Server is running on port 3636")
})