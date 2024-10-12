import { assert, expect } from "chai";
import request from "supertest";
import { describe, it } from "vitest";

import { AchievementsEntrySchema } from "../../src/interfaces/achievements_interfaces.js";
import { LoremIpsum } from "lorem-ipsum";
import { PBAuthToken, PBClient } from "../utils/PBClient.js";
import API_HOST from "../constant/API_HOST.js";
import testUnauthorized from "../common/testUnauthorized.js";
import testEntryList from "../common/testEntryList.js";
import testEntryCreation from "../common/testEntryCreation.js";
import testInvalidOrMissingValue from "../common/testInvalidOrMissingValue.js";
import testEntryNotFound from "../common/testEntryNotFound.js";
import testEntryDeletion from "../common/testEntryDeletion.js";
import testEntryModification from "../common/testEntryModification.js";
import { postTestCleanup } from "../common/postTestCleanup.js";

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

describe("GET /achievements/entries", () => {
  testUnauthorized("/achievements/entries/easy", "get");

  for (const difficulty of ["easy", "medium", "hard", "impossible"]) {
    testEntryList({
      endpoint: `/achievements/entries/${difficulty}`,
      schema: AchievementsEntrySchema,
      name: `${difficulty} achievement entry`,
    });
  }

  it("should return 400 if difficulty is not valid", async () => {
    const res = await request(API_HOST)
      .get("/achievements/entries/invalid")
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(400);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "error");
    expect(res.body).to.have.property("message", "difficulty: Invalid value");
  });

  it("should return 404 if difficulty is not provided", async () => {
    const res = await request(API_HOST)
      .get("/achievements/entries")
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(404);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "error");
    expect(res.body).to.have.property("message", "Endpoint not found");
  });
});

describe("POST /achievements/entries", () => {
  postTestCleanup("achievements_entries", "title");

  testUnauthorized("/achievements/entries", "post");

  for (const difficulty of ["easy", "medium", "hard", "impossible"]) {
    const data = {
      difficulty,
      title: lorem.generateWords(3) + "~test",
      thoughts: lorem.generateWords(10),
    };

    testEntryCreation({
      name: `${difficulty} achievement`,
      endpoint: "/achievements/entries",
      schema: AchievementsEntrySchema,
      collection: "achievements_entries",
      data,
    });
  }

  testInvalidOrMissingValue({
    name: "difficulty",
    type: "invalid",
    method: "post",
    endpoint: "/achievements/entries",
    data: {
      difficulty: "invalid",
      title: "~test",
      thoughts: "Thoughts",
    },
  });

  for (const field of ["difficulty", "title", "thoughts"]) {
    const data = {
      difficulty: "easy",
      title: "~test",
      thoughts: "Thoughts",
    };

    delete data[field as keyof typeof data];

    testInvalidOrMissingValue({
      name: field,
      type: "missing",
      method: "post",
      endpoint: "/achievements/entries",
      data,
    });
  }
});

describe("PATCH /achievements/entries/:id", () => {
  postTestCleanup("achievements_entries", "title");

  testUnauthorized("/achievements/entries/1", "patch");

  testEntryModification({
    name: "achievement",
    endpoint: "/achievements/entries",
    schema: AchievementsEntrySchema,
    collection: "achievements_entries",
    oldData: {
      difficulty: "easy",
      title: lorem.generateWords(3),
      thoughts: lorem.generateWords(10),
    },
    newData: {
      difficulty: "medium",
      title: "~updated",
      thoughts: "New thoughts",
    },
  });

  testInvalidOrMissingValue({
    name: "difficulty",
    type: "invalid",
    endpoint: "/achievements/entries/1",
    method: "patch",
    data: {
      difficulty: "invalid",
      title: "~test",
      thoughts: "Thoughts",
    },
  });

  for (const field of ["difficulty", "title", "thoughts"]) {
    const data = {
      difficulty: "easy",
      title: "~test",
      thoughts: "Thoughts",
    };

    delete data[field as keyof typeof data];

    testInvalidOrMissingValue({
      name: field,
      type: "missing",
      endpoint: "/achievements/entries/1",
      method: "patch",
      data,
    });
  }

  testEntryNotFound("/achievements/entries/1", "patch", {
    difficulty: "easy",
    title: "~test",
    thoughts: "Thoughts",
  });
});

describe("DELETE /achievements/entries/:id", () => {
  postTestCleanup("achievements_entries", "title");

  testUnauthorized("/achievements/entries/1", "delete");

  testEntryDeletion({
    name: "achievement",
    endpoint: "/achievements/entries",
    collection: "achievements_entries",
    data: {
      difficulty: "easy",
      title: "~test",
      thoughts: "Thoughts",
    },
  });

  testEntryNotFound("/achievements/entries/1", "delete");
});
