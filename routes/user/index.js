const express = require("express")
const router = express.Router()

router.post("/change-theme", ({ req, res }) => {
    const { pb } = req
    const { theme, id } = req.body

    pb.collection("user").updateOne({
        _id: id
    }, {
        $set: {
            theme
        }
    })
    res.json({
        state: "success"
    })
})

module.exports = router