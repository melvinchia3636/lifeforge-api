const express = require("express")
const router = express.Router()

router.get("/get/:id", async (req, res) => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                state: "error",
                message: "id is required",
            });

            return
        }

        const { pb } = req;
        const category = await pb
            .collection("notes_workspace")
            .getOne(req.params.id);

        res.json({
            state: "success",
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
});

router.get("/list", async (req, res) => {
    try {
        const { pb } = req;
        const categories = await pb.collection("notes_workspace").getFullList();

        res.json({
            state: "success",
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
});

module.exports = router;