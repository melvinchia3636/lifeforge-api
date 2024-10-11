import { it } from "vitest";
import { PBAuthToken, PBClient } from "../utils/PBClient.js";
import request from "supertest";
import API_HOST from "../constant/API_HOST.js";
import { expect } from "chai";

export default function testEntryDeletion({
  name,
  endpoint,
  collection,
  data,
}: {
  name: string;
  endpoint: string;
  collection: string;
  data: Record<string, any> | (() => Promise<Record<string, any>>);
  before?: () => Promise<void>;
  after?: (entry: any) => Promise<void>;
}) {
  it(`should delete an existing ${name} entry`, async () => {
    if (typeof data !== "object") {
      data = await data();
    }

    const entry = await PBClient.collection(collection).create(data);

    await request(API_HOST)
      .delete(`${endpoint}/${entry.id}`)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(204);

    await PBClient.collection(collection)
      .getOne(entry.id)
      .then(() => {
        throw new Error("Entry still exists in database");
      })
      .catch(() => {});
  });
}
