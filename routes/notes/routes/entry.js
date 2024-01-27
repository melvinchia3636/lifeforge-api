const express = require("express")
const router = express.Router()

router.get("/list/:subject/*", async (req, res) => {
    try {
        const { pb } = req;
        const notes = await pb.collection("notes_entry").getFullList({
            filter: `subject = "${req.params.subject}" && path = "${req.params[0]}"`,
        });

        res.json({
            state: "success",
            data: notes,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
})

module.exports = router;