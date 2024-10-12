import { it } from "vitest";
import request from "supertest";
import API_HOST from "../constant/API_HOST.js";
import { expect } from "chai";
import { PBAuthToken, PBClient } from "../utils/PBClient.js";
import { assert, Struct } from "superstruct";

export default async function testEntryList({
  endpoint,
  schema,
  name,
  genQueryFn,
  customAssertions,
}: {
  endpoint: string;
  schema: Struct<any>;
  name: string;
  genQueryFn?: () => Promise<string>;
  customAssertions?: (entry: any) => void;
}) {
  it(`should return a list of ${name}`, async () => {
    let query = "";
    if (genQueryFn) {
      query = await genQueryFn();
    }

    const res = await request(API_HOST)
      .get(endpoint + query)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(200);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.be.an("array");

    const entries = res.body.data;

    for (const entry of entries) {
      assert(entry, schema, `Invalid schema for ${name}`);
      if (customAssertions) {
        customAssertions(entry);
      }
    }
  });
}
