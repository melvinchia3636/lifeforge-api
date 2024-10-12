import { it } from "vitest";
import { PBAuthToken } from "../utils/PBClient.js";
import API_HOST from "../constant/API_HOST.js";
import request from "supertest";
import { expect } from "chai";

export default function testInvalidOrMissingQuery({
  name,
  type,
  endpoint,
  method,
}: {
  name: string;
  type: "invalid" | "missing";
  endpoint: string;
  method: "get" | "post" | "patch" | "delete";
}) {
  it(`should return error 400 on ${type} ${name}`, async () => {
    const stuffs = name
      .split("(")[0]
      .trim()
      .split(",")
      .map((e) => e.trim());

    const res = await request(API_HOST)
      [method](endpoint)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .expect(400);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "error");
    expect(res.body).to.have.property(
      "message",
      stuffs.map((stuff) => `${stuff}: Invalid value`).join(", ")
    );
  });
}
