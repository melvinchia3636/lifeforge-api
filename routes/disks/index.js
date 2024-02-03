const express = require("express")
const { exec } = require("child_process")

const router = express.Router()

router.get("/stats", async (req, res) => {
    try {
        const { err, stdout, stderr } = exec("df -h")
        if (err) {
            throw new Error(err)
        }
        stdout.on("data", data => {
            const result = data
                .split("\n")
                .map(e => e.split(" ")
                    .filter(e => e !== ""))
                .slice(1, -1)
                .filter(e => e[5].startsWith("/media")).map(e => ({
                    name: e[5],
                    size: e[1].replace(/(\d)([A-Z])/, "$1 $2"),
                    used: e[2].replace(/(\d)([A-Z])/, "$1 $2"),
                    avail: e[3].replace(/(\d)([A-Z])/, "$1 $2"),
                    usedPercent: e[4],
                }))

            res.json({
                state: "success",
                data: result
            })
        })

        stderr.on("data", data => {
            throw new Error(data)
        })
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        })
    }
})

module.exports = router