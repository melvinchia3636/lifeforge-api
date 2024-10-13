import express, { Request, Response } from "express";
import moment from "moment";
import {
  clientError,
  successWithBaseResponse,
} from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { body, query } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import {
  ITodoListEntry,
  ITodoListStatusCounter,
  ITodoSubtask,
} from "../../../interfaces/todo_list_interfaces.js";
import { validateExistence } from "../../../utils/PBRecordValidator.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all todo list entries
 * @description Retrieve a list of all todo list entries, filtered by status, tag, list, and priority given in the query.
 * @query status (string, optional, one_of all|today|scheduled|overdue|completed) - The status of the todo list entry
 * @query tag (string, optional, must_exist) - The tag of the todo list entry
 * @query list (string, optional, must_exist) - The list of the todo list entry
 * @query priority (string, optional, must_exist) - The priority of the todo list entry
 * @response 200 (ITodoListEntry[]) - The list of todo list entries
 */
router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(["all", "today", "scheduled", "overdue", "completed"]),
    query("tag").custom((value: string, meta) =>
      validateExistence(meta.req.pb, "todo_tags", value, true)
    ),
    query("list").custom((value: string, meta) =>
      validateExistence(meta.req.pb, "todo_lists", value, true)
    ),
    query("priority").custom((value: string, meta) =>
      validateExistence(meta.req.pb, "todo_priorities", value, true)
    ),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoListEntry[]>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const status = req.query.status || "all";

      const filters = {
        all: "done = false",
        today: `done = false && due_date >= "${moment()
          .startOf("day")
          .utc()
          .format("YYYY-MM-DD HH:mm:ss")}" && due_date <= "${moment()
          .endOf("day")
          .utc()
          .add(1, "second")
          .format("YYYY-MM-DD HH:mm:ss")}"`,
        scheduled: `done = false && due_date != "" && due_date >= "${moment()
          .utc()
          .format("YYYY-MM-DD HH:mm:ss")}"`,
        overdue: `done = false && due_date != "" && due_date < "${moment()
          .utc()
          .format("YYYY-MM-DD HH:mm:ss")}"`,
        completed: "done = true",
      };

      let finalFilter = filters[status as keyof typeof filters];

      const { tag, list, priority } = req.query;
      if (tag) finalFilter += ` && tags ~ "${tag}"`;
      if (list) finalFilter += ` && list = "${list}"`;
      if (priority) finalFilter += ` && priority = "${priority}"`;

      const entries: (ITodoListEntry & {
        expand?: { subtasks: ITodoSubtask[] };
      })[] = await pb.collection("todo_entries").getFullList({
        filter: finalFilter,
        expand: "subtasks",
      });

      entries.forEach((entries) => {
        if (entries.subtasks.length === 0) return;

        entries.subtasks =
          entries.expand?.subtasks.map((subtask: ITodoSubtask) => ({
            title: subtask.title,
            done: subtask.done,
            id: subtask.id,
          })) ?? [];

        delete entries.expand;
      });

      successWithBaseResponse(res, entries);
    }
  )
);

/**
 * @protected
 * @summary Get the amount of todo list entries in each status
 * @description Retrieve the amount of todo list entries in each status.
 * @response 200 (ITodoListStatusCounter) - The amount of todo list entries in each status
 */
router.get(
  "/status-counter",
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<ITodoListStatusCounter>>
    ) => {
      const filters = {
        all: "done = false",
        today: `done = false && due_date >= "${moment()
          .startOf("day")
          .utc()
          .format("YYYY-MM-DD HH:mm:ss")}" && due_date <= "${moment()
          .endOf("day")
          .utc()
          .add(1, "second")
          .format("YYYY-MM-DD HH:mm:ss")}"`,
        scheduled: `done = false && due_date != "" && due_date >= "${moment()
          .utc()
          .format("YYYY-MM-DD HH:mm:ss")}"`,
        overdue: `done = false && due_date != "" && due_date < "${moment()
          .utc()
          .format("YYYY-MM-DD HH:mm:ss")}"`,
        completed: "done = true",
      };

      const { pb } = req;

      const counters: ITodoListStatusCounter = {
        all: 0,
        today: 0,
        scheduled: 0,
        overdue: 0,
        completed: 0,
      };

      for (const type of Object.keys(filters) as (keyof typeof filters)[]) {
        const { totalItems } = await pb
          .collection("todo_entries")
          .getList(1, 1, {
            filter: filters[type],
          });

        counters[type] = totalItems;
      }

      successWithBaseResponse(res, counters);
    }
  )
);

/**
 * @protected
 * @summary Create a new todo list entry
 * @description Create a new todo list entry with the given title, description, due date, list, priority, tags, and subtasks.
 * @body summary (string, required) - The title of the todo list entry
 * @body notes (string, required) - The description of the todo list entry
 * @body due_date (string, required) - The due date of the todo list entry, in any format that can be parsed by moment.js
 * @body list (string, required, must_exist) - The list of the todo list entry
 * @body priority (string, required, must_exist) - The priority of the todo list entry
 * @body tags (string[], required, must_exist) - The tags of the todo list entry
 * @body subtasks (ITodoSubtask[], required) - The subtasks of the todo list entry
 * @response 201 (ITodoListEntry) - The created todo list entry
 */
router.post(
  "/",
  [
    body("summary").isString(),
    body("notes").isString(),
    body("due_date").isString(),
    body("subtasks").custom((value: ITodoSubtask[], meta) => {
      if (!Array.isArray(value)) {
        throw new Error("Invalid value");
      }

      for (const task of value) {
        if (typeof task.title !== "string") {
          throw new Error("Invalid value");
        }
      }
    }),
    body("list").custom((value: string, meta) =>
      validateExistence(meta.req.pb, "todo_lists", value, true)
    ),
    body("priority").custom((value: string, meta) =>
      validateExistence(meta.req.pb, "todo_priorities", value, true)
    ),
    body("tags").custom((value: string[], meta) => {
      for (const tag of value) {
        validateExistence(meta.req.pb, "todo_tags", tag, true);
      }
    }),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoListEntry>>) => {
      async function createSubtask() {
        if (!data.subtasks) return;

        const subtasks = [];

        for (const task of data.subtasks) {
          const subtask: ITodoSubtask = await pb
            .collection("todo_subtasks")
            .create({
              title: task.title,
            });

          subtasks.push(subtask.id);
        }

        data.subtasks = subtasks;
      }

      const { pb } = req;
      const data = req.body;

      await createSubtask();

      const entries: ITodoListEntry = await pb
        .collection("todo_entries")
        .create(data);

      if (entries.list) {
        await pb.collection("todo_lists").update(entries.list, {
          "amount+": 1,
        });
      }

      if (entries.priority) {
        await pb.collection("todo_priorities").update(entries.priority, {
          "amount+": 1,
        });
      }

      for (const tag of entries.tags) {
        await pb.collection("todo_tags").update(tag, {
          "amount+": 1,
        });
      }

      successWithBaseResponse(res, entries);
    }
  )
);

/**
 * @protected
 * @summary Update a todo list entry
 * @description Update a todo list entry with the given title, description, due date, list, priority, tags, and subtasks.
 * @param id (string, required, must_exist) - The ID of the todo list entry
 * @body summary (string, required) - The title of the todo list entry
 * @body notes (string, required) - The description of the todo list entry
 * @body due_date (string, required) - The due date of the todo list entry, in any format that can be parsed by moment.js
 * @body list (string, required, must_exist) - The list of the todo list entry
 * @body priority (string, required, must_exist) - The priority of the todo list entry
 * @body tags (string[], required, must_exist) - The tags of the todo list entry
 * @body subtasks (ITodoSubtask[], required) - The subtasks of the todo list entry
 * @response 200 (ITodoListEntry) - The updated todo list entry
 */
router.patch(
  "/:id",
  [
    body("summary").isString(),
    body("notes").isString(),
    body("due_date").isString(),
    body("subtasks").custom((value: ITodoSubtask[], meta) => {
      if (!Array.isArray(value)) {
        throw new Error("Invalid value");
      }

      for (const task of value) {
        if (
          typeof task.title !== "string" ||
          (task.id && task.hasChanged === undefined)
        ) {
          throw new Error("Invalid value");
        }
      }
    }),
    body("list").custom((value: string, meta) =>
      validateExistence(meta.req.pb, "todo_lists", value, true)
    ),
    body("priority").custom((value: string, meta) =>
      validateExistence(meta.req.pb, "todo_priorities", value, true)
    ),
    body("tags").custom((value: string[], meta) => {
      for (const tag of value) {
        validateExistence(meta.req.pb, "todo_tags", tag, true);
      }
    }),
  ],
  asyncWrapper(
    async (
      req: Request,
      res: Response<
        BaseResponse<
          Omit<ITodoListEntry, "subtasks"> & {
            subtasks: string[];
          }
        >
      >
    ) => {
      const { pb } = req;
      const { id } = req.params;

      const originalentries: Omit<ITodoListEntry, "subtasks"> & {
        subtasks: string[];
      } = await pb.collection("todo_entries").getOne(id);

      const { subtasks } = req.body;

      for (const subtaskIndex in subtasks || []) {
        const subtask = subtasks[subtaskIndex];
        let newSubtask: ITodoSubtask | { id: null } = { id: null };

        if (subtask.id.startsWith("new-")) {
          newSubtask = await pb
            .collection("todo_subtasks")
            .create({ title: subtask.title });
        } else if (subtask.hasChanged) {
          await pb.collection("todo_subtasks").update(subtask.id, {
            title: subtask.title,
          });
        }

        subtasks[subtaskIndex] = newSubtask.id || subtask.id;
      }

      const entries: Omit<ITodoListEntry, "subtasks"> & {
        subtasks: string[];
      } = await pb.collection("todo_entries").update(id, req.body);

      for (const list of [...new Set([originalentries.list, entries.list])]) {
        if (!list) continue;

        const { totalItems } = await pb
          .collection("todo_entries")
          .getList(1, 1, {
            filter: `list ~ "${list}"`,
          });

        await pb.collection("todo_lists").update(list, {
          amount: totalItems,
        });
      }

      for (const priority of [
        ...new Set([originalentries.priority, entries.priority]),
      ]) {
        if (!priority) continue;

        const { totalItems } = await pb
          .collection("todo_entries")
          .getList(1, 1, {
            filter: `priority ~ "${priority}"`,
          });

        await pb.collection("todo_priorities").update(priority, {
          amount: totalItems,
        });
      }

      for (const tag of [
        ...new Set([...originalentries.tags, ...entries.tags]),
      ]) {
        if (!tag) continue;

        const { totalItems } = await pb
          .collection("todo_entries")
          .getList(1, 1, {
            filter: `tags ~ "${tag}"`,
          });

        await pb.collection("todo_tags").update(tag, {
          amount: totalItems,
        });
      }

      for (const subtask of originalentries.subtasks) {
        if (entries.subtasks.includes(subtask)) continue;

        await pb.collection("todo_subtasks").delete(subtask);
      }

      successWithBaseResponse(res, entries);
    }
  )
);

/**
 * @protected
 * @summary Delete a todo list entry
 * @description Delete a todo list entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the todo list entry
 * @response 204 - The todo list entry was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    const entries: Omit<ITodoListEntry, "subtasks"> & {
      subtasks: string[];
    } = await pb.collection("todo_entries").getOne(id);

    await pb.collection("todo_entries").delete(id);

    if (entries.list) {
      await pb.collection("todo_lists").update(entries.list, {
        "amount-": 1,
      });
    }

    if (entries.priority) {
      await pb.collection("todo_priorities").update(entries.priority, {
        "amount-": 1,
      });
    }

    for (const tag of entries.tags) {
      await pb.collection("todo_tags").update(tag, {
        "amount-": 1,
      });
    }

    for (const subtask of entries.subtasks) {
      await pb.collection("todo_subtasks").delete(subtask);
    }

    successWithBaseResponse(res, undefined, 204);
  })
);

/**
 * @protected
 * @summary Toggle a todo list entry
 * @description Toggle the done status of a todo list entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the todo list entry
 * @response 200 (ITodoListEntry) - The updated todo list entry
 */
router.post(
  "/toggle/:id",
  asyncWrapper(
    async (
      req: Request,
      res: Response<
        BaseResponse<
          Omit<ITodoListEntry, "subtasks"> & {
            subtasks: string[];
          }
        >
      >
    ) => {
      const { pb } = req;
      const { id } = req.params;

      const entries: Omit<ITodoListEntry, "subtasks"> & {
        subtasks: string[];
      } = await pb.collection("todo_entries").getOne(id);

      if (!entries.done) {
        for (const subtask of entries.subtasks) {
          await pb.collection("todo_subtasks").update(subtask, {
            done: true,
          });
        }
      }

      const entry: Omit<ITodoListEntry, "subtasks"> & {
        subtasks: string[];
      } = await pb.collection("todo_entries").update(id, {
        done: !entries.done,
        completed_at: entries.done
          ? null
          : moment().utc().format("YYYY-MM-DD HH:mm:ss"),
      });

      successWithBaseResponse(res, entry);
    }
  )
);

export default router;
