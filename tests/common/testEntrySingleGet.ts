import { it } from "vitest";
import { PBAuthToken, PBClient } from "../utils/PBClient.js";
import request from "supertest";
import API_HOST from "../constant/API_HOST.js";
import { assert, Struct } from "superstruct";
import { expect } from "chai";

export default function testEntrySingleGet({
  name,
  endpoint,
  collection,
  schema,
  data,
}: {
  name: string;
  endpoint: string;
  collection: string;
  schema: Struct<any>;
  data: Record<string, any> | (() => Promise<Record<string, any>>);
}) {
  it(`should return the ${name} with the specified id`, async () => {
    if (typeof data !== "object") {
      data = await data();
    }

    const entry = await PBClient.collection(collection).create(data);

    const res = await request(API_HOST)
      .get(`${endpoint}/${entry.id}`)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(200);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    expect(res.body).to.have.property("data");
    assert(res.body.data, schema);

    const fetchedEntry = res.body.data;

    for (const key in data) {
      const value = fetchedEntry[key];
      const expected = data[key];

      expect(value).to.equal(expected);
    }
  });
}
