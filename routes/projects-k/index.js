const express = require("express")
const router = express.Router()

router.use("/entry", require("./routes/entry"))
router.use("/progress", require("./routes/progress"))
router.use("/files", require("./routes/files"))

router.get("/ip", async (req, res) => {
    import("node-public-ip").then(async ({ publicIp }) => {
        const ip = await publicIp()
        res.json({
            state: "success",
            data: ip
        })
    });
})

module.exports = router