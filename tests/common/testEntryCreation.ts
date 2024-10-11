import { expect } from "chai";
import request from "supertest";
import { it } from "vitest";
import API_HOST from "../constant/API_HOST.js";
import { PBAuthToken, PBClient } from "../utils/PBClient.js";
import { assert, Struct } from "superstruct";

export default function testEntryCreation({
  name,
  endpoint,
  schema,
  collection,
  data,
}: {
  name: string;
  endpoint: string;
  schema: Struct<any>;
  collection: string;
  data: Record<string, any> | (() => Promise<Record<string, any>>);
}) {
  it(`should create a new ${name} entry`, async () => {
    if (typeof data !== "object") {
      data = await data();
    }

    const res = await request(API_HOST)
      .post(endpoint)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .send(data)
      .expect(201);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.be.instanceOf(Object);

    const result = res.body.data;

    if (Array.isArray(result)) {
      for (const entry of result) {
        assert(entry, schema, "Invalid schema for entry");

        for (const key in data) {
          const value = entry[key as keyof typeof data];
          const expectedValue = data[key];

          if (["date", "time"].includes(key)) {
            expect(new Date(value).getTime()).to.equal(
              new Date(expectedValue).getTime()
            );
            continue;
          }

          expect(value).to.equal(expectedValue);
        }

        await PBClient.collection(collection)
          .getOne(entry.id)
          .catch(() => {
            throw new Error("Entry not found in database");
          });
      }
    } else {
      assert(result, schema, "Invalid schema for entry");

      for (const key in data) {
        const value = result[key as keyof typeof data];
        const expectedValue = data[key];
        expect(value).to.equal(expectedValue);
      }

      await PBClient.collection(collection)
        .getOne(result.id)
        .catch(() => {
          throw new Error("Entry not found in database");
        });
    }
  });
}
