const express = require("express")
const { exec } = require("child_process")
const os = require("os")
const osUtils = require('os-utils');
const si = require('systeminformation');

const router = express.Router()

router.get("/disks", async (req, res) => {
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

router.get("/memory", (req, res) => {
    try {
        const total = os.totalmem()
        const free = os.freemem()
        const used = total - free
        const percent = (used / total) * 100

        res.json({
            state: "success",
            data: {
                total: total,
                free: free,
                used: used,
                percent: percent
            }
        })
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message
        })
    }
})

router.get("/cpu", (req, res) => {
    try {
        osUtils.cpuUsage(function (v) {
            const cpuCoreCount = os.cpus().length
            res.json({
                state: "success",
                data: {
                    usage: v * 100,
                    core_count: cpuCoreCount
                }
            })
        })
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message
        })
    }
})

router.get("/info", async (req, res) => {
    try {
        const osInfo = await si.osInfo()
        const cpu = await si.cpu()
        const mem = await si.mem()
        const networkInterfaces = await si.networkInterfaces()
        const networkStats = await si.networkStats()

        res.json({
            state: "success",
            data: {
                osInfo,
                cpu,
                mem,
                networkInterfaces,
                networkStats,
            }
        })
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message
        })
    }
})

router.get("/cpu-temp", async (req, res) => {
    try {
        const temp = await si.cpuTemperature()
        res.json({
            state: "success",
            data: temp
        })
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message
        })
    }
})


module.exports = router