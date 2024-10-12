import { it } from "vitest";
import { PBAuthToken, PBClient } from "../utils/PBClient.js";
import request from "supertest";
import API_HOST from "../constant/API_HOST.js";
import { expect } from "chai";
import { assert } from "console";
import { Struct } from "superstruct";

export default function testEntryModification({
  name,
  action = "update",
  endpoint,
  method = "patch",
  schema,
  collection,
  oldData,
  newData,
  additionalAssertions,
  dataCreationSideEffects,
}: {
  name: string;
  action?: string;
  method?: "patch" | "put" | "post";
  endpoint: string;
  schema: Struct<any>;
  collection: string;
  oldData: Record<string, any> | (() => Promise<Record<string, any>>);
  newData:
    | Record<string, any>
    | ((oldEntry: Record<string, any>) => Promise<Record<string, any>>);
  additionalAssertions?: (entry: any) => Promise<void>;
  dataCreationSideEffects?: (entry: any) => Promise<void>;
}) {
  it(`should ${action} an exsisting ${name}`, async () => {
    if (typeof oldData !== "object") {
      oldData = await oldData();
    }

    const entry = await PBClient.collection(collection).create(oldData);
    dataCreationSideEffects?.(entry);

    if (typeof newData !== "object") {
      newData = await newData(entry);
    }

    const res = await request(API_HOST)
      [method](`${endpoint}/${entry.id}`)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .send(newData)
      .expect(200);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.be.an("object");

    const updatedEntry = res.body.data;

    assert(updatedEntry, schema, `Invalid schema for ${name}`);

    expect(updatedEntry.id).to.equal(entry.id);
    for (const key in newData) {
      const value = updatedEntry[key as keyof typeof newData];
      const expectedValue = newData[key];

      if (["date", "time"].includes(key)) {
        expect(new Date(value).getTime()).to.equal(
          new Date(expectedValue).getTime()
        );
        continue;
      }

      expect(value).to.equal(expectedValue);
    }

    additionalAssertions?.(updatedEntry);
  });
}
