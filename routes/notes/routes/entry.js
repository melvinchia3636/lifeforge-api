const express = require("express")
const router = express.Router()
const fs = require("fs")

const uploadMiddleware = require('../../../middleware/uploadMiddleware');

router.get("/list/:subject/*", async (req, res) => {
    try {
        const { pb } = req;
        const notes = await pb.collection("notes_entry").getFullList({
            filter: `subject = "${req.params.subject}" && parent = "${req.params[0].split("/").pop()}"`,
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

router.get("/path/:workspace/:subject/*", async (req, res) => {
    try {
        const { pb } = req;

        const workspace = await pb.collection("notes_workspace").getOne(req.params.workspace);
        const subject = await pb.collection("notes_subject").getOne(req.params.subject);
        const paths = req.params[0].split("/").filter(p => p !== "");

        const result = [{
            id: workspace.id,
            name: workspace.name,
        }, {
            id: subject.id,
            name: subject.title,
        }];

        for (let path of paths) {
            const note = await pb.collection("notes_entry").getOne(path);
            result.push({
                id: path,
                name: note.name,
            });
        }

        res.json({
            state: "success",
            data: {
                icon: subject.icon,
                path: result,
            },
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
})

router.put("/create/folder", async (req, res) => {
    try {
        const { pb } = req;

        const name = req.body.name
        const existing = await pb.collection("notes_entry").getFullList({
            filter: `name = "${name}" && parent = "${req.body.parent}" && subject = "${req.body.subject}"`,
        });

        if (existing.length > 0) {
            res.status(400).json({
                state: "error",
                message: "Duplicate name",
            });
            return
        }

        const note = await pb.collection("notes_entry").create(req.body);

        res.json({
            state: "success",
            data: note,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
})


router.post("/upload/:workspace/:subject/*", uploadMiddleware, async (req, res) => {
    try {
        const { pb } = req;

        if (req.files.length === 0) {
            return res.status(400).send({
                state: "error",
                message: "No files were uploaded.",
            });
        }

        for (let file of req.files) {
            let parent = req.params[0].split("/").pop()

            if (file.originalname.endsWith(".DS_Store")) {
                try {
                    fs.unlinkSync(file.path);
                } catch (error) { }
                continue
            }

            file.originalname = decodeURIComponent(file.originalname);

            const path = file.originalname.split("/");
            const name = path.pop();

            for (let i = 0; i < path.length; i++) {
                const existing = await pb.collection("notes_entry").getFullList({
                    filter: `name = "${path[i]}" && parent = "${parent}" && subject = "${req.params.subject}"`,
                });

                if (existing.length > 0) {
                    parent = existing[0].id;
                } else {
                    const note = await pb.collection("notes_entry").create({
                        name: path[i],
                        type: "folder",
                        parent,
                        subject: req.params.subject,
                    }, { '$autoCancel': false });

                    parent = note.id;
                }
            }

            const existing = await pb.collection("notes_entry").getFullList({
                filter: `name = "${name}" && parent = "${parent}" && subject = "${req.params.subject}"`,
            });

            if (existing.length > 0) {
                continue
            }

            if (fs.existsSync(file.path)) {
                const fileBuffer = fs.readFileSync(file.path);

                await pb.collection("notes_entry").create({
                    name,
                    type: "file",
                    parent,
                    subject: req.params.subject,
                    file: new File([fileBuffer], name, { type: file.mimetype }),
                }, { '$autoCancel': false });

                try {
                    fs.unlinkSync(file.path);
                } catch (error) {
                }
            }
        }

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
})

router.patch("/update/folder/:id", async (req, res) => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                state: "error",
                message: "id is required",
            });

            return
        }

        const { pb } = req;
        const note = await pb.collection("notes_entry").update(req.params.id, req.body);

        res.json({
            state: "success",
            data: note,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
})

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
        await pb.collection("notes_entry").delete(req.params.id);

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
})

module.exports = router;