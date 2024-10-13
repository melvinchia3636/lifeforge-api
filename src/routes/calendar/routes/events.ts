import express, { Request, Response } from "express";
import { successWithBaseResponse } from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { list } from "../../../utils/CRUD.js";
import { ICalendarEvent } from "../../../interfaces/calendar_interfaces.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { validateExistence } from "../../../utils/PBRecordValidator.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all calendar events
 * @description Retrieve a list of all calendar events.
 * @response 200 (ICalendarEvent[]) - The list of calendar events
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ICalendarEvent[]>>) =>
      list<ICalendarEvent>(req, res, "calendar_events")
  )
);

/**
 * @protected
 * @summary Create a new calendar event
 * @description Create a new calendar event with the given title, start, and end.
 * @body title (string, required) - The title of the event
 * @body start (string, required) - The start date and time of the event
 * @body end (string, required) - The end date and time of the event
 * @body category (string, optional, must_exist) - The category of the event
 * @response 201 (ICalendarEvent) - The created calendar event
 */
router.post(
  "/",
  [
    body("title").exists().notEmpty(),
    body("start").exists().notEmpty(),
    body("end").exists().notEmpty(),
    body("category").custom((value, meta) =>
      validateExistence(meta.req.pb, "calendar_categories", value, true)
    ),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ICalendarEvent>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { title, start, end, category } = req.body;

      const events: ICalendarEvent = await pb
        .collection("calendar_events")
        .create({
          title,
          start,
          end,
          category: category || "",
        });

      if (category) {
        await pb.collection("calendar_categories").update(category, {
          "amount+": 1,
        });
      }

      successWithBaseResponse(res, events);
    }
  )
);

/**
 * @protected
 * @summary Update a calendar event
 * @description Update a calendar event with the given title, start, and end.
 * @param id (string, required, must_exist) - The ID of the event
 * @body title (string, required) - The title of the event
 * @body start (string, required) - The start date and time of the event
 * @body end (string, required) - The end date and time of the event
 * @body category (string, optional, must_exist) - The category of the event
 * @response 200 (ICalendarEvent) - The updated calendar event
 */
router.patch(
  "/:id",
  [
    body("title").exists().notEmpty(),
    body("start").exists().notEmpty(),
    body("end").exists().notEmpty(),
    body("category").custom((value, meta) =>
      validateExistence(meta.req.pb, "calendar_categories", value, true)
    ),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ICalendarEvent>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { title, start, end, category } = req.body;

      const oldEvent = await pb.collection("calendar_events").getOne(id);
      const events: ICalendarEvent = await pb
        .collection("calendar_events")
        .update(id, {
          title,
          start,
          end,
          category: category || "",
        });

      if (oldEvent.category !== category) {
        if (oldEvent.category) {
          await pb.collection("calendar_categories").update(oldEvent.category, {
            "amount-": 1,
          });
        }

        if (category) {
          await pb.collection("calendar_categories").update(category, {
            "amount+": 1,
          });
        }
      }

      successWithBaseResponse(res, events);
    }
  )
);

/**
 * @protected
 * @summary Delete a calendar event
 * @description Delete a calendar event with the given ID.
 * @param id (string, required, must_exist) - The ID of the event
 * @response 200 - The calendar event was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    const event = await pb.collection("calendar_events").getOne(id);

    await pb.collection("calendar_events").delete(id);

    if (event.category) {
      await pb.collection("calendar_categories").update(event.category, {
        "amount-": 1,
      });
    }

    successWithBaseResponse(res);
  })
);

export default router;
