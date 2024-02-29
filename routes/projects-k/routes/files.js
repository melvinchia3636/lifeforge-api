const express = require("express")
const fs = require("fs")
const mime = require('mime-types');

const router = express.Router()

router.put("/replace/:projectId", async (req, res) => {
    try {
        const { pb } = req
        const newFiles = fs.readdirSync("/media/melvinchia/99961e79-8ea0-4504-8eaa-dc8bbddaff25/uploads").filter(file => !file.startsWith("."))

        if (newFiles.length === 0) {
            return res.status(401).json({
                state: "error",
                message: "No files are detected in the uploads folder"
            })
        }

        await pb.collection('projects_k_entry').update(req.params.projectId, {
            files: null,
        });

        await pb.collection('projects_k_entry').update(req.params.projectId, {
            files: newFiles.map(file => {
                const buffer = fs.readFileSync(`/media/melvinchia/99961e79-8ea0-4504-8eaa-dc8bbddaff25/uploads/${file}`);
                return new File([buffer], file, { type: mime.lookup(file) })
            }),
            last_file_replacement_time: new Date().toISOString()
        });

        for (const file of newFiles) {
            fs.unlinkSync(`/media/melvinchia/99961e79-8ea0-4504-8eaa-dc8bbddaff25/uploads/${file}`);
        }

        return res.json({
            state: "success",
            data: newFiles
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

router.get("/download/:projectId", async (req, res) => {
    try {
        const { pb } = req
        const project = await pb.collection("projects_k_entry").getOne(req.params.projectId)
        const { files, collectionId, id } = project

        if (!files) {
            return res.status(401).json({
                state: "error",
                message: "No files are detected in the project"
            })
        }

        for (const file of files) {
            const location = `/media/melvinchia/99961e79-8ea0-4504-8eaa-dc8bbddaff25/database/pb_data/storage/${collectionId}/${id}/${file}`
            fs.copyFileSync(location, `/media/melvinchia/99961e79-8ea0-4504-8eaa-dc8bbddaff25/uploads/${file.split(".")[0].split("_").slice(0, -1).join("_")}.${file.split(".").pop()}`)
        }

        res.json({
            state: "success",
        })

    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

router.delete("/clear-medium", async (req, res) => {
    try {
        const files = fs.readdirSync("/media/melvinchia/99961e79-8ea0-4504-8eaa-dc8bbddaff25/uploads").filter(file => !file.startsWith("."))
        for (const file of files) {
            fs.unlinkSync(`/media/melvinchia/99961e79-8ea0-4504-8eaa-dc8bbddaff25/uploads/${file}`)
        }
        res.json({
            state: "success",
        })

    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

router.put("/set-thumbnail/:projectId", async (req, res) => {
    try {
        const { pb } = req
        const { file } = req.body

        const project = await pb.collection("projects_k_entry").getOne(req.params.projectId)

        const type = mime.lookup(file)

        if (!["image/png", "image/jpeg"].includes(type)) {
            return res.status(401).json({
                state: "error",
                message: "File type is not supported"
            })
        }

        const buffer = fs.readFileSync(`/media/melvinchia/99961e79-8ea0-4504-8eaa-dc8bbddaff25/database/pb_data/storage/${project.collectionId}/${project.id}/${file}`);
        await pb.collection('projects_k_entry').update(req.params.projectId, {
            thumbnail: new File([buffer], file, { type }),
            thumb_original_filename: file
        });

        res.json({
            state: "success",
        })

    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

module.exports = router