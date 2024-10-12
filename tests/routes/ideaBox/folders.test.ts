import { describe } from "vitest";
import { IdeaBoxFolderSchema } from "../../../src/interfaces/ideabox_interfaces.js";
import testUnauthorized from "../../common/testUnauthorized.js";
import testEntryList from "../../common/testEntryList.js";
import testEntryCreation from "../../common/testEntryCreation.js";
import testInvalidOrMissingValue from "../../common/testInvalidOrMissingValue.js";
import testEntryNotFound from "../../common/testEntryNotFound.js";
import testEntryDeletion from "../../common/testEntryDeletion.js";
import testEntryModification from "../../common/testEntryModification.js";
import { postTestCleanup } from "../../common/postTestCleanup.js";
import testEntrySingleGet from "../../common/testEntrySingleGet.js";
import testEntryValidation from "../../common/testEntryValidation.js";
import { PBClient } from "../../utils/PBClient.js";

async function generateDummyContainer() {
  const entry = await PBClient.collection("idea_box_containers").create(
    {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    },
    {
      $autoCancel: false,
    }
  );

  return entry;
}

describe("GET /idea-box/folders/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");

  testUnauthorized("/idea-box/folders/123", "get");

  testEntrySingleGet({
    name: "idea-box folder",
    endpoint: "/idea-box/folders",
    schema: IdeaBoxFolderSchema,
    collection: "idea_box_folders",
    data: async () => {
      const container = await generateDummyContainer();

      return {
        name: "~test",
        icon: "test-icon",
        color: "#000000",
        container: container.id,
      };
    },
  });

  testEntryNotFound("/idea-box/folders/123", "get");
});

describe("GET /idea-box/folders/valid/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");

  testUnauthorized("/idea-box/folders/valid/123", "get");

  testEntryValidation({
    name: "idea-box folder",
    endpoint: "/idea-box/folders/valid",
    collection: "idea_box_folders",
    schema: IdeaBoxFolderSchema,
    data: async () => {
      const container = await generateDummyContainer();

      return {
        name: "~test",
        icon: "test-icon",
        color: "#000000",
        container: container.id,
      };
    },
  });
});

describe("GET /idea-box/folders", () => {
  testUnauthorized("/idea-box/folders", "get");

  testEntryList({
    endpoint: "/idea-box/folders",
    schema: IdeaBoxFolderSchema,
    name: "idea-box folder",
    genQueryFn: async () => {
      const container = await generateDummyContainer();

      await PBClient.collection("idea_box_folders").create(
        {
          name: "~test",
          icon: "test-icon",
          color: "#000000",
          container: container.id,
        },
        {
          $autoCancel: false,
        }
      );
      return `?container=${container.id}`;
    },
  });

  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");
});

describe("POST /idea-box/folders", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");

  testUnauthorized("/idea-box/folders", "post");

  testEntryCreation({
    name: "idea-box folder",
    endpoint: "/idea-box/folders",
    schema: IdeaBoxFolderSchema,
    collection: "idea_box_folders",
    data: async () => {
      const container = await generateDummyContainer();

      return {
        name: "~test",
        icon: "test-icon",
        color: "#000000",
        container: container.id,
      };
    },
  });

  testInvalidOrMissingValue({
    name: "name",
    type: "invalid",
    endpoint: "/idea-box/folders",
    method: "post",
    data: async () => {
      const container = await generateDummyContainer();

      return {
        name: 123,
        icon: "test-icon",
        color: "#000000",
        container: container.id,
      };
    },
  });

  testInvalidOrMissingValue({
    name: "icon",
    type: "invalid",
    endpoint: "/idea-box/folders",
    method: "post",
    data: async () => {
      const container = await generateDummyContainer();

      return {
        name: "~test",
        icon: 123,
        color: "#000000",
        container: container.id,
      };
    },
  });

  testInvalidOrMissingValue({
    name: "color",
    type: "invalid",
    endpoint: "/idea-box/folders",
    method: "post",
    data: async () => {
      const container = await generateDummyContainer();

      return {
        name: "~test",
        icon: "test-icon",
        color: "gejkredwk",
        container: container.id,
      };
    },
  });

  testInvalidOrMissingValue({
    name: "container",
    type: "invalid",
    endpoint: "/idea-box/folders",
    method: "post",
    data: {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
      container: "not a container",
    },
  });

  for (const key of ["name", "icon", "color", "container"]) {
    testInvalidOrMissingValue({
      name: key,
      type: "missing",
      endpoint: "/idea-box/folders",
      method: "post",
      data: async () => {
        const container = await generateDummyContainer();
        const data = {
          name: "~test",
          icon: "test-icon",
          color: "#000000",
          container: container.id,
        };

        delete data[key as keyof typeof data];

        return data;
      },
    });
  }
});

describe("PATCH /idea-box/folders/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");

  testUnauthorized("/idea-box/folders/123", "patch");

  testEntryModification({
    name: "idea-box folder",
    endpoint: "/idea-box/folders",
    schema: IdeaBoxFolderSchema,
    collection: "idea_box_folders",
    oldData: {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    },
    newData: {
      name: "~updated",
      icon: "test-icon2",
      color: "#ffffff",
    },
  });

  testInvalidOrMissingValue({
    name: "name",
    type: "invalid",
    endpoint: "/idea-box/folders/123",
    method: "patch",
    data: {
      name: 123,
      icon: "test-icon2",
      color: "#ffffff",
    },
  });

  testInvalidOrMissingValue({
    name: "icon",
    type: "invalid",
    endpoint: "/idea-box/folders/123",
    method: "patch",
    data: {
      name: "~updated",
      icon: 123,
      color: "#ffffff",
    },
  });

  testInvalidOrMissingValue({
    name: "color",
    type: "invalid",
    endpoint: "/idea-box/folders/123",
    method: "patch",
    data: {
      name: "~updated",
      icon: "test-icon2",
      color: "not a color hex",
    },
  });

  for (const key of ["name", "icon", "color"]) {
    testInvalidOrMissingValue({
      name: key,
      type: "missing",
      endpoint: "/idea-box/folders/123",
      method: "patch",
      data: async () => {
        const container = await generateDummyContainer();
        const data = {
          name: "~updated",
          icon: "test-icon2",
          color: "#ffffff",
          container: container.id,
        };

        delete data[key as keyof typeof data];

        return data;
      },
    });
  }

  testEntryNotFound("/idea-box/folders/123", "patch", {
    name: "~updated",
    icon: "test-icon2",
    color: "#ffffff",
  });
});

describe("DELETE /idea-box/folders/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");

  testUnauthorized("/idea-box/folders/123", "delete");

  testEntryDeletion({
    name: "idea-box folder",
    endpoint: "/idea-box/folders",
    collection: "idea_box_folders",
    data: async () => {
      const container = await generateDummyContainer();

      return {
        name: "~test",
        icon: "test-icon",
        color: "#000000",
        container: container.id,
      };
    },
  });

  testEntryNotFound("/idea-box/folders/123", "delete");
});
