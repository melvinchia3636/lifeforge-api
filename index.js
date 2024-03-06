require('dotenv').config({ path: '.env.local' });

const express = require("express")
const cors = require("cors")
const Pocketbase = require('pocketbase/cjs');
const all_routes = require('express-list-endpoints');
const morganMiddleware = require("./middleware/morganMiddleware");

const initPB = async (req, res, next) => {
    const bearerToken = req.headers.authorization?.split(" ")[1]
    const pb = new Pocketbase(process.env.PB_HOST)

    if (req.url === "/" || req.url.startsWith("/spotify") || req.url.startsWith("/code-time")) {
        req.pb = pb
        next()
        return
    }

    try {
        pb.authStore.save(bearerToken, null)

        try {
            await pb.collection('users').authRefresh()
        } catch (error) {
            if (error.response.code === 401) {
                res.status(401).send({
                    state: "error",
                    message: "Invalid authorization credentials"
                })
                return
            }
        }

        req.pb = pb
        next()
    } catch (error) {
        res.status(500).send({
            state: "error",
            message: "Internal server error"
        })
    }
}

const app = express()
app.set('view engine', 'ejs');


app.use(morganMiddleware);
app.use(cors())
app.use(express.json())
app.use(initPB)

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
app.use('/user', require("./routes/user"))
app.use('/projects-k', require("./routes/projects-k"))
app.use("/todo-list", require("./routes/todoList"))
app.use("/idea-box", require("./routes/ideaBox"))
app.use("/code-time", require("./routes/codeTime"))
app.use("/notes", require("./routes/notes"))
app.use('/spotify', require("./routes/spotify"))
app.use('/photos', require("./routes/photos"))
app.use('/server', require("./routes/server"))
app.use("/change-log", require("./routes/changeLog"))
app.use(function (req, res, next) {
    res.status(404);

    res.json({
        state: "error",
        message: "Not Found"
    });
});

// app.get("/books/list", (req, res) => {
//     const { stdout, stderr } = exec("/Applications/calibre.app/Contents/MacOS/calibredb list --for-machine", (err, stdout, stderr) => {
//         if (err) {
//             return
//         }
//         res.json(JSON.parse(stdout))
//     })
// })


const server = app.listen(3636, () => {
    console.log("Server is running on port 3636")
})
