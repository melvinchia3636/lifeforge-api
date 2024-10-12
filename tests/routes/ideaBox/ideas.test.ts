import { describe, it } from "vitest";
import { IdeaBoxEntrySchema } from "../../../src/interfaces/ideabox_interfaces.js";
import testUnauthorized from "../../common/testUnauthorized.js";
import testEntryList from "../../common/testEntryList.js";
import testEntryCreation from "../../common/testEntryCreation.js";
import testInvalidOrMissingValue from "../../common/testInvalidOrMissingValue.js";
import testEntryNotFound from "../../common/testEntryNotFound.js";
import testEntryDeletion from "../../common/testEntryDeletion.js";
import testEntryModification from "../../common/testEntryModification.js";
import { postTestCleanup } from "../../common/postTestCleanup.js";
import { PBAuthToken, PBClient } from "../../utils/PBClient.js";
import { expect } from "chai";
import testInvalidOrMissingQuery from "../../common/testInvalidOrMissingQuery.js";
import request from "supertest";
import API_HOST from "../../constant/API_HOST.js";
import { assert } from "superstruct";

async function generateDummyData() {
  const container = await PBClient.collection("idea_box_containers").create(
    {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    },
    {
      $autoCancel: false,
    }
  );

  const folder = await PBClient.collection("idea_box_folders").create(
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

  const entryOutsideFolder = await PBClient.collection(
    "idea_box_entries"
  ).create(
    {
      title: "~test",
      type: "text",
      content: "test-content",
      container: container.id,
    },
    {
      $autoCancel: false,
    }
  );

  const entryInsideFolder = await PBClient.collection(
    "idea_box_entries"
  ).create(
    {
      title: "~test",
      type: "text",
      content: "~test",
      folder: folder.id,
      container: container.id,
    },
    {
      $autoCancel: false,
    }
  );

  const archivedEntry = await PBClient.collection("idea_box_entries").create(
    {
      type: "text",
      content: "~test",
      container: container.id,
      archived: true,
    },
    {
      $autoCancel: false,
    }
  );

  return {
    container,
    folder,
    entryOutsideFolder,
    entryInsideFolder,
    archivedEntry,
  };
}

async function testEntryCountInContainer(
  entry: Record<string, any>,
  type: string,
  count: number
) {
  const container = await PBClient.collection("idea_box_containers").getOne(
    entry.container
  );

  expect(container[`${type}_count`]).to.equal(count);
}

describe("GET /idea-box/ideas/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");
  postTestCleanup("idea_box_entries", "content");

  testUnauthorized("/idea-box/ideas", "get");

  testEntryList({
    endpoint: "/idea-box/ideas",
    schema: IdeaBoxEntrySchema,
    name: "idea-box idea in folder",
    genQueryFn: async () => {
      const { folder, container } = await generateDummyData();
      return `?folder=${folder.id}&container=${container.id}`;
    },
    customAssertions: (res) => {
      expect(res.folder).is.not.empty.string;
    },
  });

  testEntryList({
    endpoint: "/idea-box/ideas",
    schema: IdeaBoxEntrySchema,
    name: "idea-box idea outside folder",
    genQueryFn: async () => {
      const { container } = await generateDummyData();
      return `?container=${container.id}`;
    },
    customAssertions: (res) => {
      expect(res.folder).is.empty.string;
    },
  });

  testEntryList({
    endpoint: "/idea-box/ideas",
    schema: IdeaBoxEntrySchema,
    name: "idea-box archived idea",
    genQueryFn: async () => {
      const { container } = await generateDummyData();
      return `?container=${container.id}&archived=true`;
    },
    customAssertions: (res) => {
      expect(res.archived).is.true;
    },
  });

  testInvalidOrMissingQuery({
    name: "container",
    type: "missing",
    endpoint: "/idea-box/ideas",
    method: "get",
  });

  testInvalidOrMissingQuery({
    name: "container",
    type: "invalid",
    endpoint: "/idea-box/ideas?container=123",
    method: "get",
  });
});

describe("POST /idea-box/ideas", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");
  postTestCleanup("idea_box_entries", "content");

  testUnauthorized("/idea-box/ideas", "post");

  testEntryCreation({
    name: "idea-box text idea",
    endpoint: "/idea-box/ideas",
    schema: IdeaBoxEntrySchema,
    collection: "idea_box_entries",
    data: async () => {
      const { container } = await generateDummyData();
      return {
        type: "text",
        title: "~test",
        content: "~test",
        container: container.id,
      };
    },
    additionalAssertions: (entry) =>
      testEntryCountInContainer(entry, "text", 1),
  });

  testEntryCreation({
    name: "idea-box link idea",
    endpoint: "/idea-box/ideas",
    schema: IdeaBoxEntrySchema,
    collection: "idea_box_entries",
    data: async () => {
      const { container } = await generateDummyData();
      return {
        type: "link",
        title: "~test",
        content: "~test https://test.com",
        container: container.id,
      };
    },
    additionalAssertions: (entry) =>
      testEntryCountInContainer(entry, "link", 1),
  });

  testEntryCreation({
    name: "idea-box text idea in folder",
    endpoint: "/idea-box/ideas",
    schema: IdeaBoxEntrySchema,
    collection: "idea_box_entries",
    data: async () => {
      const { folder, container } = await generateDummyData();
      return {
        type: "text",
        title: "~test",
        content: "~test",
        folder: folder.id,
        container: container.id,
      };
    },
    additionalAssertions: (entry) =>
      testEntryCountInContainer(entry, "text", 1),
  });

  testEntryCreation({
    name: "idea-box link idea in folder",
    endpoint: "/idea-box/ideas",
    schema: IdeaBoxEntrySchema,
    collection: "idea_box_entries",
    data: async () => {
      const { folder, container } = await generateDummyData();
      return {
        type: "link",
        title: "~test",
        content: "~test https://test.com",
        folder: folder.id,
        container: container.id,
      };
    },
    additionalAssertions: (entry) =>
      testEntryCountInContainer(entry, "link", 1),
  });

  testInvalidOrMissingValue({
    name: "type",
    type: "invalid",
    endpoint: "/idea-box/ideas",
    method: "post",
    data: async () => {
      const { container } = await generateDummyData();
      return {
        type: "invalid",
        title: "~test",
        content: "~test",
        container: container.id,
      };
    },
  });

  testInvalidOrMissingValue({
    name: "title",
    type: "invalid",
    endpoint: "/idea-box/ideas",
    method: "post",
    data: async () => {
      const { container } = await generateDummyData();
      return {
        type: "text",
        title: 123,
        content: "~test",
        container: container.id,
      };
    },
  });

  testInvalidOrMissingValue({
    name: "content",
    type: "invalid",
    endpoint: "/idea-box/ideas",
    method: "post",
    data: async () => {
      const { container } = await generateDummyData();
      return {
        type: "text",
        title: "~test",
        content: 123,
        container: container.id,
      };
    },
  });

  testInvalidOrMissingValue({
    name: "container",
    type: "invalid",
    endpoint: "/idea-box/ideas",
    method: "post",
    data: {
      type: "text",
      title: "~test",
      content: "~test",
      container: 123,
    },
  });

  testInvalidOrMissingValue({
    name: "folder",
    type: "invalid",
    endpoint: "/idea-box/ideas",
    method: "post",
    data: async () => {
      const { container } = await generateDummyData();
      return {
        type: "text",
        title: "~test",
        content: "~test",
        folder: 123,
        container: container.id,
      };
    },
  });

  for (const key of ["type", "title", "content", "container"]) {
    testInvalidOrMissingValue({
      name: key,
      type: "missing",
      endpoint: "/idea-box/ideas",
      method: "post",
      data: async () => {
        const { container } = await generateDummyData();
        const data = {
          type: "text",
          title: "~test",
          content: "~test",
          container: container.id,
        };

        delete data[key as keyof typeof data];

        return data;
      },
    });
  }
});

describe("PATCH /idea-box/ideas/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");
  postTestCleanup("idea_box_entries", "content");

  testUnauthorized("/idea-box/ideas/123", "patch");

  testEntryModification({
    name: "idea-box idea outside folder (link -> text)",
    endpoint: "/idea-box/ideas",
    schema: IdeaBoxEntrySchema,
    collection: "idea_box_entries",
    oldData: async () => {
      const { container } = await generateDummyData();
      return {
        type: "link",
        title: "~test",
        content: "~test",
        container: container.id,
      };
    },
    newData: {
      type: "text",
      title: "~updated",
      content: "~updated",
    },
    additionalAssertions: async (entry) => {
      const container = await PBClient.collection("idea_box_containers").getOne(
        entry.container
      );

      expect(container.text_count).to.equal(1);
      expect(container.link_count).to.equal(0);
    },
    dataCreationSideEffects: async (data) => {
      const container = await PBClient.collection("idea_box_containers").getOne(
        data.container
      );

      await PBClient.collection("idea_box_containers").update(container.id, {
        link_count: 1,
      });
    },
  });

  testEntryModification({
    name: "idea-box idea in folder (text -> link)",
    endpoint: "/idea-box/ideas",
    schema: IdeaBoxEntrySchema,
    collection: "idea_box_entries",
    oldData: async () => {
      const { folder, container } = await generateDummyData();
      return {
        type: "text",
        title: "~test",
        content: "~test",
        folder: folder.id,
        container: container.id,
      };
    },
    newData: {
      type: "link",
      title: "~updated",
      content: "~updated",
    },
    additionalAssertions: async (entry) => {
      const folder = await PBClient.collection("idea_box_containers").getOne(
        entry.container
      );

      expect(folder.text_count).to.equal(0);
      expect(folder.link_count).to.equal(1);
    },
    dataCreationSideEffects: async (data) => {
      const container = await PBClient.collection("idea_box_containers").getOne(
        data.container
      );

      await PBClient.collection("idea_box_containers").update(container.id, {
        text_count: 1,
      });
    },
  });

  testInvalidOrMissingValue({
    name: "type",
    type: "invalid",
    endpoint: "/idea-box/ideas/123",
    method: "patch",
    data: {
      type: "invalid",
      title: "~test",
      content: "~test",
    },
  });

  testInvalidOrMissingValue({
    name: "title",
    type: "invalid",
    endpoint: "/idea-box/ideas/123",
    method: "patch",
    data: {
      type: "text",
      title: 123,
      content: "~test",
    },
  });

  testInvalidOrMissingValue({
    name: "content",
    type: "invalid",
    endpoint: "/idea-box/ideas/123",
    method: "patch",
    data: {
      type: "text",
      title: "~test",
      content: 123,
    },
  });

  for (const key of ["type", "title", "content"]) {
    const data = {
      type: "text",
      title: "~test",
      content: "~test",
    };

    delete data[key as keyof typeof data];

    testInvalidOrMissingValue({
      name: key,
      type: "missing",
      endpoint: "/idea-box/ideas/123",
      method: "patch",
      data,
    });
  }

  testEntryNotFound("/idea-box/ideas/123", "patch", {
    type: "text",
    title: "~test",
    content: "~test",
  });
});

describe("DELETE /idea-box/ideas/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");
  postTestCleanup("idea_box_entries", "content");

  testUnauthorized("/idea-box/ideas/123", "delete");

  for (const type of ["text", "link"]) {
    testEntryDeletion({
      name: `idea-box ${type} idea outside folder`,
      endpoint: "/idea-box/ideas",
      collection: "idea_box_entries",
      data: async () => {
        const { container } = await generateDummyData();
        return {
          type,
          title: "~test",
          content: "~test",
          container: container.id,
        };
      },
      additionalAssertions: (entry) =>
        testEntryCountInContainer(entry, type, 0),
      entryCreationSideEffects: async (entry) => {
        await PBClient.collection("idea_box_containers").update(
          entry.container,
          {
            [`${type}_count`]: 1,
          }
        );
      },
    });

    testEntryDeletion({
      name: `idea-box ${type} idea in folder`,
      endpoint: "/idea-box/ideas",
      collection: "idea_box_entries",
      data: async () => {
        const { folder, container } = await generateDummyData();
        return {
          type,
          title: "~test",
          content: "~test",
          folder: folder.id,
          container: container.id,
        };
      },
      additionalAssertions: (entry) =>
        testEntryCountInContainer(entry, type, 0),
      entryCreationSideEffects: async (entry) => {
        await PBClient.collection("idea_box_containers").update(
          entry.container,
          {
            [`${type}_count`]: 1,
          }
        );
      },
    });
  }

  testEntryNotFound("/idea-box/ideas/123", "delete", {
    type: "text",
    title: "~test",
    content: "~test",
  });
});

describe("POST /idea-box/pin/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");
  postTestCleanup("idea_box_entries", "content");

  testUnauthorized("/idea-box/pin/123", "post");

  testEntryModification({
    name: "idea-box idea",
    action: "pin",
    method: "post",
    endpoint: "/idea-box/ideas/pin",
    schema: IdeaBoxEntrySchema,
    collection: "idea_box_entries",
    oldData: async () => {
      const { container } = await generateDummyData();
      return {
        type: "text",
        title: "~test",
        content: "~test",
        container: container.id,
      };
    },
    newData: {
      pinned: true,
    },
  });

  testEntryModification({
    name: "idea-box idea",
    action: "unpin",
    method: "post",
    endpoint: "/idea-box/ideas/pin",
    schema: IdeaBoxEntrySchema,
    collection: "idea_box_entries",
    oldData: async () => {
      const { container } = await generateDummyData();
      return {
        type: "text",
        title: "~test",
        content: "~test",
        container: container.id,
        pinned: true,
      };
    },
    newData: {
      pinned: false,
    },
  });

  testEntryNotFound("/idea-box/ideas/pin/123", "post", {
    pinned: true,
  });
});

describe("POST /idea-box/archive/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");
  postTestCleanup("idea_box_entries", "content");

  testUnauthorized("/idea-box/archive/123", "post");

  testEntryModification({
    name: "idea-box idea",
    action: "archive",
    method: "post",
    endpoint: "/idea-box/ideas/archive",
    schema: IdeaBoxEntrySchema,
    collection: "idea_box_entries",
    oldData: async () => {
      const { container } = await generateDummyData();
      return {
        type: "text",
        title: "~test",
        content: "~test",
        container: container.id,
      };
    },
    newData: {
      archived: true,
    },
  });

  testEntryModification({
    name: "idea-box idea",
    action: "unarchive",
    method: "post",
    endpoint: "/idea-box/ideas/archive",
    schema: IdeaBoxEntrySchema,
    collection: "idea_box_entries",
    oldData: async () => {
      const { container } = await generateDummyData();
      return {
        type: "text",
        title: "~test",
        content: "~test",
        container: container.id,
        archived: true,
      };
    },
    newData: {
      archived: false,
    },
  });

  testEntryNotFound("/idea-box/ideas/archive/123", "post", {
    archived: true,
  });
});

describe("POST /idea-box/folder/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");
  postTestCleanup("idea_box_entries", "content");

  testUnauthorized("/idea-box/folder/123", "post");

  it("should move an idea to a folder", async () => {
    const { folder, entryOutsideFolder } = await generateDummyData();

    const res = await request(API_HOST)
      .post(
        `/idea-box/ideas/folder/${entryOutsideFolder.id}?folder=${folder.id}`
      )
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(200);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    assert(res.body.data, IdeaBoxEntrySchema);
    expect(res.body.data.folder).to.equal(folder.id);
  });

  it("should return 404 if the idea is not found", async () => {
    const { folder } = await generateDummyData();

    const res = await request(API_HOST)
      .post(`/idea-box/ideas/folder/123?folder=${folder.id}`)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(404);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "error");
    expect(res.body).to.have.property("message", "Entry not found");
  });

  testInvalidOrMissingQuery({
    name: "folder",
    type: "missing",
    endpoint: "/idea-box/ideas/folder/123",
    method: "post",
  });

  testInvalidOrMissingQuery({
    name: "folder",
    type: "invalid",
    endpoint: "/idea-box/ideas/folder/123?folder=123",
    method: "post",
  });
});

describe("DELETE /idea-box/folder/:id", async () => {
  postTestCleanup("idea_box_containers");
  postTestCleanup("idea_box_folders");
  postTestCleanup("idea_box_entries", "content");

  testUnauthorized("/idea-box/folder/123", "delete");

  it("should remove an idea from a folder", async () => {
    const { entryInsideFolder } = await generateDummyData();

    const res = await request(API_HOST)
      .delete(`/idea-box/ideas/folder/${entryInsideFolder.id}`)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(200);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    assert(res.body.data, IdeaBoxEntrySchema);
    expect(res.body.data.folder).to.be.empty.string;
  });

  it("should return 404 if the idea is not found", async () => {
    const res = await request(API_HOST)
      .delete("/idea-box/ideas/folder/123")
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(404);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "error");
    expect(res.body).to.have.property("message", "Entry not found");
  });
});
