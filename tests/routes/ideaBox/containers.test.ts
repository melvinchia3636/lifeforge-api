import { describe } from "vitest";
import { IdeaBoxContainerSchema } from "../../../src/interfaces/ideabox_interfaces.js";
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

describe("GET /idea-box/containers/:id", () => {
  postTestCleanup("idea_box_containers");

  testUnauthorized("/idea-box/containers/123", "get");

  testEntrySingleGet({
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

  testEntryNotFound("/idea-box/containers/123", "get");
});

describe("GET /idea-box/containers/valid/:id", () => {
  postTestCleanup("idea_box_containers");

  testUnauthorized("/idea-box/containers/valid/123", "get");

  testEntryValidation({
    name: "idea-box container",
    endpoint: "/idea-box/containers/valid",
    collection: "idea_box_containers",
    schema: IdeaBoxContainerSchema,
    data: {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    },
  });
});

describe("GET /idea-box/containers", () => {
  testUnauthorized("/idea-box/containers", "get");
  testEntryList({
    endpoint: "/idea-box/containers",
    schema: IdeaBoxContainerSchema,
    name: "idea-box container",
  });
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
