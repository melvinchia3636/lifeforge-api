import { it } from "vitest";
import { PBAuthToken, PBClient } from "../utils/PBClient.js";
import request from "supertest";
import API_HOST from "../constant/API_HOST.js";
import { Struct } from "superstruct";
import { expect } from "chai";

export default function testEntryValidation({
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
  it(`should return true if the ${name} exists`, async () => {
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
    expect(res.body).to.have.property("data", true);
  });

  it(`should return false if the ${name} does not exist`, async () => {
    const res = await request(API_HOST)
      .get(`${endpoint}/123`)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(200);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    expect(res.body).to.have.property("data", false);
  });
}
