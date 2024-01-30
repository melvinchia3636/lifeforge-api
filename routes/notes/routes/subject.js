const express = require("express");
const router = express.Router();

router.get("/list/:id", async (req, res) => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                state: "error",
                message: "id is required",
            });

            return
        }

        const { pb } = req;
        const subjects = await pb.collection("notes_subject").getFullList({
            filter: `workspace = "${req.params.id}"`,
        });

        res.json({
            state: "success",
            data: subjects,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
});

router.put("/create", async (req, res) => {
    try {
        const { pb } = req;

        const title = req.body.title;
        const existing = await pb.collection("notes_subject").getFullList({
            filter: `title = "${title}" && workspace = "${req.body.workspace}"`,
        });
        if (existing.length > 0) {
            res.status(400).json({
                state: "error",
                message: "Subject already exists",
            });

            return
        }
        const subject = await pb.collection("notes_subject").create(req.body);

        res.json({
            state: "success",
            data: subject,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                state: "error",
                message: "id is required",
            });

            return
        }

        const { pb } = req;
        await pb.collection("notes_subject").delete(req.params.id);

        res.json({
            state: "success",
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
});

router.patch("/update/:id", async (req, res) => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                state: "error",
                message: "id is required",
            });

            return
        }

        const { pb } = req;
        const subject = await pb
            .collection("notes_subject")
            .update(req.params.id, req.body);

        res.json({
            state: "success",
            data: subject,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
});

module.exports = router;