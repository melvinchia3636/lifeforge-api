/* eslint-disable no-param-reassign */
import express from 'express';

const router = express.Router();

router.get('/list-steps', async (req, res) => {
    try {
        const { pb } = req;
        const steps = await pb.collection('projects_k_progress_step').getFullList();

        res.json({
            state: 'success',
            data: steps,
        });
    } catch (error) {
        res.status(500).send({
            state: 'error',
            message: error.message,
        });
    }
});

router.get('/get/:id', async (req, res) => {
    try {
        const { pb } = req;
        let project = await pb.collection('projects_k_entry').getOne(req.params.id, {
            expand: 'progress.steps',
        });

        project = project.expand.progress;

        project.expand.steps.forEach((steps) => {
            steps.forEeach((key) => {
                if (!['name', 'icon', 'id'].includes(key)) {
                    delete steps[key];
                }
            });
        });

        project.expand.steps = Object.fromEntries(
            project.expand.steps.map((step) => [
                step.id,
                { name: step.name, icon: step.icon },
            ]),
        );

        res.json({
            state: 'success',
            data: project,
        });
    } catch (error) {
        res.status(500).send({
            state: 'error',
            message: error.message,
        });
    }
});

router.patch('/complete-step/:id', async (req, res) => {
    try {
        const { pb } = req;
        const project = await pb.collection('projects_k_entry').getOne(req.params.id, {
            expand: 'progress.steps',
        });
        const progressRecord = project.expand.progress;

        await pb.collection('projects_k_progress').update(progressRecord.id, {
            'completed+': 1,
        });

        res.json({
            state: 'success',
        });
    } catch (error) {
        res.status(500).send({
            state: 'error',
            message: error.message,
        });
    }
});

router.patch('/uncomplete-step/:id', async (req, res) => {
    try {
        const { pb } = req;
        const project = await pb.collection('projects_k_entry').getOne(req.params.id, {
            expand: 'progress.steps',
        });
        const progressRecord = project.expand.progress;

        await pb.collection('projects_k_progress').update(progressRecord.id, {
            'completed-': 1,
        });

        res.json({
            state: 'success',
        });
    } catch (error) {
        res.status(500).send({
            state: 'error',
            message: error.message,
        });
    }
});

export default router;
