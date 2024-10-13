import { GoogleGenerativeAI } from "@google/generative-ai";
import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import {
  clientError,
  successWithBaseResponse,
} from "../../../utils/response.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import {
  ITodoListEntry,
  ITodoSubtask,
} from "../../../interfaces/todo_list_interfaces.js";
import { fetchGroq } from "../../../utils/fetchGroq.js";
import { getAPIKey } from "../../../utils/getAPIKey.js";

const router = express.Router();

const BREAKDOWN_LEVELS = [
  "Very Brief - High-level steps, only the main tasks. Number of steps should not exceed 5",
  "Somewhat detailed - More steps, but still broad. Number of steps should not exceed 10",
  "Detailed - Includes most steps, clear and comprehensive. Number of steps should not exceed 20",
  "Very detailed - Thorough, covers almost every step. Number of steps should not exceed 30",
  "Exhaustive - Every single step, extremely detailed. Number of steps should not exceed 50",
];

/**
 * @protected
 * @summary Get a list of all subtasks for a todo list entry
 * @description Retrieve a list of all subtasks for a todo list entry.
 * @param id (string, required, must_exist) - The ID of the todo list entry
 * @response 200 (ITodoSubtask[]) - The list of subtasks
 */
router.get(
  "/list/:id",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoSubtask[]>>) => {
      const { pb } = req;
      const { id } = req.params;

      const entries: ITodoListEntry & {
        expand?: { subtasks: ITodoSubtask[] };
      } = await pb.collection("todo_entries").getOne(id, {
        expand: "subtasks",
      });

      successWithBaseResponse(
        res,
        entries.expand ? entries.expand.subtasks : []
      );
    }
  )
);

/**
 * @protected
 * @summary Get a list of subtasks for a todo list entry
 * @description Use Groq to generate a list of suggested relevant subtasks for a given task.
 * @body summary (string, required) - The summary of the task
 * @body notes (string, optional) - The notes of the task
 * @body level (number, required, one_of 0|1|2|3|4) - The level of breakdown for the subtasks, the higher the number, the more amount of subtasks generated
 * @response 200 (string[]) - The list of subtasks
 */
router.post(
  "/ai-generate",
  [
    body("summary").isString(),
    body("notes").optional().isString(),
    body("level").exists().isInt().isIn([0, 1, 2, 3, 4]),
  ],
  asyncWrapper(async (req: Request, res: Response<BaseResponse<string[]>>) => {
    if (hasError(req, res)) return;

    const key = await getAPIKey("groq", req.pb);

    if (!key) {
      clientError(res, "API key not found");
      return;
    }

    const { summary, notes, level } = req.body;

    const prompt = `Generate a detailed list of subtasks for completing the following task: "${summary.trim()}".${notes.trim() ? `Also, take into consideration that there is notes to the task being "${notes.trim()}".` : ""} The list should be organized in a logical sequence. The level of breakdown should be ${
      BREAKDOWN_LEVELS[level]
    }. Ensure the output is in the form of a single-level flat JavaScript array, with each element containing only the task content, written in the same language as the given task, and without any additional details, comments, explanations, or nested subtasks or details of the subtask. Make sure not to wrap the output array in any code environment, and the output array should be plain text that can be parsed by javascript JSON.parse() function. Keep in mind that there SHOULD NOT be a comma at the end of the last element in the array.`;

    const response = await fetchGroq(key, prompt);
    if (!response) {
      clientError(res, "Error fetching data");
      return;
    }

    const text = JSON.parse(response);

    successWithBaseResponse(res, text);
  })
);

/**
 * @protected
 * @summary Toggle the completion status of a subtask
 * @description Mark a subtask as done or not done, toggling the completion status.
 * @param id (string, required, must_exist) - The ID of the todo list entry
 * @body content (string, required) - The content of the subtask
 * @response 201 (ITodoSubtask) - The updated subtask
 */
router.patch(
  "/toggle/:id",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoSubtask>>) => {
      const { pb } = req;
      const { id } = req.params;

      const entries = await pb.collection("todo_subtask").getOne(id);

      const subtask: ITodoSubtask = await pb
        .collection("todo_subtask")
        .update(id, {
          done: !entries.done,
        });

      successWithBaseResponse(res, subtask);
    }
  )
);

export default router;
