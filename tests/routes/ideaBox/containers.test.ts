import { afterAll, describe, it } from "vitest";
import { IdeaBoxContainerSchema } from "../../../src/interfaces/ideabox_interfaces.js";
import testUnauthorized from "../../common/testUnauthorized.js";
import testList from "../../common/testList.js";
import testEntryCreation from "../../common/testEntryCreation.js";
import testInvalidOrMissingValue from "../../common/testInvalidOrMissingValue.js";
import testEntryNotFound from "../../common/testEntryNotFound.js";
import testEntryDeletion from "../../common/testEntryDeletion.js";
import testEntryModification from "../../common/testEntryModification.js";
import { postTestCleanup } from "../../common/postTestCleanup.js";
import { PBAuthToken, PBClient } from "../../utils/PBClient.js";
import request from "supertest";
import API_HOST from "../../constant/API_HOST.js";
import { expect } from "chai";
import { assert } from "superstruct";

describe("GET /idea-box/containers/:id", () => {
  postTestCleanup("idea_box_containers");

  testUnauthorized("/idea-box/containers/123", "get");

  it("should return the idea-box container with the specified id", async () => {
    const container = {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    };

    const entry = await PBClient.collection("idea_box_containers").create(
      container
    );

    const res = await request(API_HOST)
      .get(`/idea-box/containers/${entry.id}`)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(200);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    expect(res.body).to.have.property("data");
    assert(res.body.data, IdeaBoxContainerSchema);

    const data = res.body.data;

    for (const key in container) {
      const value = data[key as keyof typeof container];
      const expected = container[key as keyof typeof container];

      expect(value).to.equal(expected);
    }
  });

  testEntryNotFound("/idea-box/containers/123", "get");
});

describe("GET /idea-box/containers/valid/:id", () => {
  postTestCleanup("idea_box_containers");

  testUnauthorized("/idea-box/containers/valid/123", "get");

  it("should return true if the idea-box container exists", async () => {
    const container = {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    };

    const entry = await PBClient.collection("idea_box_containers").create(
      container
    );

    const res = await request(API_HOST)
      .get(`/idea-box/containers/valid/${entry.id}`)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(200);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    expect(res.body).to.have.property("data", true);
  });

  it("should return false if the idea-box container does not exist", async () => {
    const res = await request(API_HOST)
      .get("/idea-box/containers/valid/123")
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(200);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    expect(res.body).to.have.property("data", false);
  });
});

describe("GET /idea-box/containers", () => {
  testUnauthorized("/idea-box/containers", "get");
  testList(
    "/idea-box/containers",
    IdeaBoxContainerSchema,
    "idea-box container"
  );
});

describe("POST /idea-box/containers", () => {
  postTestCleanup("idea_box_containers");

  testUnauthorized("/idea-box/containers", "post");

  testEntryCreation({
    name: "idea-box container",
    endpoint: "/idea-box/containers",
    schema: IdeaBoxContainerSchema,
    collection: "idea_box_containers",
    data: {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    },
  });

  testInvalidOrMissingValue({
    name: "name",
    type: "invalid",
    endpoint: "/idea-box/containers",
    method: "post",
    data: {
      name: 123,
      icon: "test-icon",
      color: "#000000",
    },
  });

  testInvalidOrMissingValue({
    name: "icon",
    type: "invalid",
    endpoint: "/idea-box/containers",
    method: "post",
    data: {
      name: "~test",
      icon: 123,
      color: "#000000",
    },
  });

  testInvalidOrMissingValue({
    name: "color",
    type: "invalid",
    endpoint: "/idea-box/containers",
    method: "post",
    data: {
      name: "~test",
      icon: "test-icon",
      color: "gejkredwk",
    },
  });

  for (const key of ["name", "icon", "color"]) {
    const data = {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    };

    delete data[key as keyof typeof data];

    testInvalidOrMissingValue({
      name: key,
      type: "missing",
      endpoint: "/idea-box/containers",
      method: "post",
      data,
    });
  }
});

describe("PATCH /idea-box/containers/:id", () => {
  postTestCleanup("idea_box_containers");

  testUnauthorized("/idea-box/containers/123", "patch");

  testEntryModification({
    name: "idea-box container",
    endpoint: "/idea-box/containers",
    schema: IdeaBoxContainerSchema,
    collection: "idea_box_containers",
    oldData: {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    },
    newData: {
      name: "~updated",
      icon: "updated-icon",
      color: "#FFFFFF",
    },
  });

  testInvalidOrMissingValue({
    name: "color",
    type: "invalid",
    endpoint: "/idea-box/containers/123",
    method: "patch",
    data: {
      name: "~updated",
      icon: "updated-icon",
      color: "eifjsgrj",
    },
  });

  testInvalidOrMissingValue({
    name: "icon",
    type: "invalid",
    endpoint: "/idea-box/containers/123",
    method: "patch",
    data: {
      name: "~updated",
      icon: 123,
      color: "#FFFFFF",
    },
  });

  testInvalidOrMissingValue({
    name: "name",
    type: "invalid",
    endpoint: "/idea-box/containers/123",
    method: "patch",
    data: {
      name: 123,
      icon: "updated-icon",
      color: "#FFFFFF",
    },
  });

  for (const key of ["name", "icon", "color"]) {
    const data = {
      name: "~updated",
      icon: "updated-icon",
      color: "#FFFFFF",
    };

    delete data[key as keyof typeof data];

    testInvalidOrMissingValue({
      name: key,
      type: "missing",
      endpoint: "/idea-box/containers/123",
      method: "patch",
      data,
    });
  }

  testEntryNotFound("/idea-box/containers/123", "patch", {
    name: "~updated",
    icon: "updated-icon",
    color: "#FFFFFF",
  });
});

describe("DELETE /idea-box/containers/:id", () => {
  postTestCleanup("idea_box_containers");

  testUnauthorized("/idea-box/containers/123", "delete");

  testEntryDeletion({
    name: "idea-box container",
    endpoint: "/idea-box/containers",
    collection: "idea_box_containers",
    data: {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    },
  });

  testEntryNotFound("/idea-box/containers/123", "delete");
});
