const express = require("express")
const router = express.Router()
const fs = require("fs")
const mime = require('mime-types');

router.get("/get/:id", async (req, res) => {
    try {
        const { pb } = req
        const project = await pb.collection("projects_k_entry").getOne(req.params.id)
        console.log(project)
        res.json({
            state: "success",
            data: project
        })
    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

router.get("/valid/:id", async (req, res) => {
    try {
        const { pb } = req
        const { id } = req.params

        const { totalItems } = await pb.collection("projects_k_entry").getList(1, 1, {
            filter: `id = "${id}"`
        })

        if (totalItems === 1) {
            res.json({
                state: "success",
                data: true
            })
        } else {
            res.json({
                state: "success",
                data: false
            })
        }
    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

router.get("/list", async (req, res) => {
    try {
        const { pb } = req
        let projects = await pb.collection("projects_k_entry").getFullList({
            expand: "progress,payment_status"
        })


        projects.forEach(project => {
            project.progress = project.expand.progress
            project.payment_status = project.expand.payment_status
            delete project.expand
        })

        res.json({
            state: "success",
            data: projects
        })
    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

router.post("/create", async (req, res) => {
    try {
        const { pb } = req
        const {
            name,
            customerName,
            visibility,
            status,
            totalPayable,
            deposit,
            steps
        } = req.body

        if (!name || !steps || !status || !visibility) {
            return res.status(400).send({
                state: "error",
                message: "Missing required fields"
            })
        }

        if (visibility === "commercial") {
            if (!customerName || !totalPayable || !deposit) {
                return res.status(400).send({
                    state: "error",
                    message: "Missing required fields"
                })
            }

            if (totalPayable < deposit) {
                return res.status(400).send({
                    state: "error",
                    message: "Deposit cannot be greater than total payable"
                })
            }
        }

        const paymentStatusRecord = visibility === "commercial" ? await pb.collection("projects_k_payment_status").create({
            total_amt: totalPayable,
            deposit_amt: deposit,
            deposit_paid: false,
            fully_paid: false
        }) : undefined

        const progressRecord = await pb.collection("projects_k_progress").create({
            steps,
            completed: 0
        })

        const project = await pb.collection("projects_k_entry").create({
            name,
            customer_name: visibility === "commercial" ? customerName : undefined,
            type: visibility,
            status,
            payment_status: paymentStatusRecord ? paymentStatusRecord.id : undefined,
            progress: progressRecord.id
        })

        res.json({
            state: "success",
            data: project
        })
    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

router.patch("/update-status/:id", async (req, res) => {
    try {
        const { pb } = req
        const { status } = req.body

        if (!status) {
            return res.status(400).send({
                state: "error",
                message: "Missing required fields"
            })
        }

        const project = await pb.collection("projects_k_entry").update(req.params.id, {
            status
        })

        res.json({
            state: "success",
            data: project
        })
    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

module.exports = router