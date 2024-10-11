import * as s from "superstruct";
import { BasePBCollectionSchema } from "./pocketbase_interfaces.js";

const IdeaBoxContainerSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    color: s.string(),
    icon: s.string(),
    image_count: s.number(),
    link_count: s.number(),
    name: s.string(),
    text_count: s.number(),
  })
);

const IdeaBoxFolderSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    color: s.string(),
    icon: s.string(),
    name: s.string(),
    containers: s.string(),
  })
);

const IdeaBoxEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    container: s.string(),
    folder: s.string(),
    content: s.optional(s.string()),
    image: s.optional(s.string()),
    title: s.optional(s.string()),
    type: s.enums(["text", "image", "link"]),
    pinned: s.boolean(),
    archived: s.boolean(),
  })
);

type IIdeaBoxContainer = s.Infer<typeof IdeaBoxContainerSchema>;
type IIdeaBoxFolder = s.Infer<typeof IdeaBoxFolderSchema>;
type IIdeaBoxEntry = s.Infer<typeof IdeaBoxEntrySchema>;

export { IdeaBoxContainerSchema, IdeaBoxFolderSchema, IdeaBoxEntrySchema };
export type { IIdeaBoxContainer, IIdeaBoxFolder, IIdeaBoxEntry };
