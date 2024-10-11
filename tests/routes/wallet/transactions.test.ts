import { describe, it } from "vitest";
import {
  WalletLedgerSchema,
  WalletTransactionEntrySchema,
} from "../../../src/interfaces/wallet_interfaces.js";
import testUnauthorized from "../../common/testUnauthorized.js";
import testList from "../../common/testList.js";
import testEntryCreation from "../../common/testEntryCreation.js";
import testInvalidOrMissingValue from "../../common/testInvalidOrMissingValue.js";
import testEntryNotFound from "../../common/testEntryNotFound.js";
import testEntryDeletion from "../../common/testEntryDeletion.js";
import testEntryModification from "../../common/testEntryModification.js";
import { PBAuthToken, PBClient } from "../../utils/PBClient.js";
import request from "supertest";
import { assert } from "superstruct";
import { expect } from "chai";
import API_HOST from "../../constant/API_HOST.js";
import { postTestCleanup } from "../../common/postTestCleanup.js";

async function createDummyData(isTransfer = false) {
  const dummyCategory = await PBClient.collection("wallet_categories").create({
    name: "~test",
    icon: "test-icon",
    color: "#000000",
    type: "expenses",
  });

  const dummyLedger = await PBClient.collection("wallet_ledgers").create({
    name: "~test",
    icon: "test-icon",
    color: "#000000",
  });

  const dummyAsset = await PBClient.collection("wallet_assets").create({
    name: "~test",
    icon: "test-icon",
    starting_balance: 1000,
  });

  let dummyAsset2;

  if (isTransfer) {
    dummyAsset2 = await PBClient.collection("wallet_assets").create({
      name: "~test2",
      icon: "test-icon",
      starting_balance: 1000,
    });
  }

  return { dummyCategory, dummyLedger, dummyAsset, dummyAsset2 };
}

describe("GET /wallet/ledgers", () => {
  postTestCleanup("wallet_transactions", "particulars");
  postTestCleanup("wallet_assets");
  postTestCleanup("wallet_categories");
  postTestCleanup("wallet_ledgers");

  testUnauthorized("/wallet/transactions", "get");

  testList(
    "/wallet/transactions",
    WalletTransactionEntrySchema,
    "wallet transaction"
  );
});

describe("POST /wallet/transactions", async () => {
  testUnauthorized("/wallet/transactions", "post");

  for (const type of ["income", "expenses"]) {
    testEntryCreation({
      name: `${type} transaction`,
      endpoint: "/wallet/transactions",
      schema: WalletTransactionEntrySchema,
      collection: "wallet_transactions",
      data: async () => {
        const { dummyCategory, dummyLedger, dummyAsset } =
          await createDummyData();

        return {
          type: type,
          side: type === "income" ? "credit" : "debit",
          particulars: "~test",
          amount: 100,
          date: new Date().toISOString(),
          category: dummyCategory.id,
          asset: dummyAsset.id,
          ledger: dummyLedger.id,
        };
      },
    });
  }

  it("should create a new transfer transaction entry", async () => {
    const { dummyAsset, dummyAsset2 } = await createDummyData(true);

    const data = {
      type: "transfer",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      fromAsset: dummyAsset.id,
      toAsset: dummyAsset2!.id,
    };

    const expectedResult = [
      {
        ...data,
        particulars: "Transfer from ~test",
        fromAsset: undefined,
        toAsset: undefined,
        side: "debit",
        asset: dummyAsset2!.id,
      },
      {
        ...data,
        particulars: "Transfer to ~test2",
        fromAsset: undefined,
        toAsset: undefined,
        side: "credit",
        asset: dummyAsset.id,
      },
    ];

    const res = await request(API_HOST)
      .post("/wallet/transactions")
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .send(data)
      .expect(201);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "success");
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.be.instanceOf(Object);

    const result = res.body.data;

    for (const idx in result) {
      assert(
        result[idx],
        WalletTransactionEntrySchema,
        "Invalid schema for entry"
      );

      for (const key in expectedResult[+idx]) {
        const value = result[idx][key as keyof typeof data];
        const expectedValue = expectedResult[+idx][key as keyof typeof data];

        if (["date", "time"].includes(key)) {
          expect(new Date(value ?? "").getTime()).to.equal(
            new Date(expectedValue ?? "").getTime()
          );
          continue;
        }

        expect(value).to.equal(expectedValue);
      }

      await PBClient.collection("wallet_transactions")
        .getOne(result[idx].id)
        .catch(() => {
          throw new Error("Entry not found in database");
        });

      await PBClient.collection("wallet_transactions").delete(result[idx].id);
    }
  });

  testInvalidOrMissingValue({
    name: "type",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "invalid",
      side: "credit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
    },
  });

  testInvalidOrMissingValue({
    name: "side (expenses)",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "expenses",
      side: "credit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
    },
  });

  testInvalidOrMissingValue({
    name: "side (income)",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "income",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
    },
  });

  testInvalidOrMissingValue({
    name: "particulars",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "expenses",
      side: "debit",
      particulars: 123,
      amount: 100,
      date: new Date().toISOString(),
    },
  });

  testInvalidOrMissingValue({
    name: "amount",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: "abc",
      date: new Date().toISOString(),
    },
  });

  testInvalidOrMissingValue({
    name: "date",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: "abc",
    },
  });

  testInvalidOrMissingValue({
    name: "category",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      category: "invalid",
    },
  });

  testInvalidOrMissingValue({
    name: "asset",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      asset: "invalid",
    },
  });

  testInvalidOrMissingValue({
    name: "ledger",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      ledger: "invalid",
    },
  });

  testInvalidOrMissingValue({
    name: "fromAsset, toAsset",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "transfer",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      fromAsset: "invalid",
      toAsset: "invalid",
    },
  });

  testInvalidOrMissingValue({
    name: "fromAsset, toAsset (expenses type)",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "income",
      side: "credit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      fromAsset: "invalid",
      toAsset: "invalid",
    },
  });

  testInvalidOrMissingValue({
    name: "fromAsset, toAsset (income type)",
    type: "invalid",
    method: "post",
    endpoint: "/wallet/transactions",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      fromAsset: "invalid",
      toAsset: "invalid",
    },
  });

  for (const field of ["type", "side", "particulars", "amount", "date"]) {
    const data = {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
    };

    delete data[field as keyof typeof data];

    testInvalidOrMissingValue({
      name: field,
      type: "missing",
      method: "post",
      endpoint: "/wallet/transactions",
      data,
    });
  }
});

describe("PATCH /wallet/transactions/:id", () => {
  postTestCleanup("wallet_transactions", "particulars");
  postTestCleanup("wallet_assets");
  postTestCleanup("wallet_categories");
  postTestCleanup("wallet_ledgers");

  testUnauthorized("/wallet/transactions/1", "patch");

  testEntryModification({
    name: "wallet transaction",
    endpoint: "/wallet/transactions",
    schema: WalletTransactionEntrySchema,
    collection: "wallet_transactions",
    oldData: async () => {
      const { dummyCategory, dummyLedger, dummyAsset } =
        await createDummyData();

      return {
        type: "expenses",
        side: "debit",
        particulars: "~test",
        amount: 100,
        date: new Date().toISOString(),
        category: dummyCategory.id,
        asset: dummyAsset.id,
        ledger: dummyLedger.id,
      };
    },
    newData: async () => {
      const { dummyCategory, dummyLedger, dummyAsset } =
        await createDummyData();

      return {
        type: "income",
        side: "credit",
        particulars: "~test2",
        amount: 200,
        date: new Date().toISOString(),
        category: dummyCategory.id,
        asset: dummyAsset.id,
        ledger: dummyLedger.id,
      };
    },
  });

  it("should not update a transfer transaction entry", async () => {
    const { dummyLedger, dummyCategory, dummyAsset, dummyAsset2 } =
      await createDummyData(true);

    const entry = await PBClient.collection("wallet_transactions").create({
      type: "transfer",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      fromAsset: dummyAsset.id,
      toAsset: dummyAsset2!.id,
    });

    entry.particulars = "~test2";

    const res = await request(API_HOST)
      .patch(`/wallet/transactions/${entry.id}`)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .send(entry)
      .expect(400);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "error");
    expect(res.body).to.have.property("message", "type: Invalid value");
  });

  it("should not allow to update a transaction entry to transfer", async () => {
    const { dummyLedger, dummyCategory, dummyAsset, dummyAsset2 } =
      await createDummyData(true);

    const entry = await PBClient.collection("wallet_transactions").create({
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      category: dummyCategory.id,
      asset: dummyAsset.id,
      ledger: dummyLedger.id,
    });

    entry.type = "transfer";

    const res = await request(API_HOST)
      .patch(`/wallet/transactions/${entry.id}`)
      .set("Authorization", `Bearer ${PBAuthToken}`)
      .send(entry)
      .expect(400);

    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("state", "error");
    expect(res.body).to.have.property("message", "type: Invalid value");
  });

  testInvalidOrMissingValue({
    name: "type",
    type: "invalid",
    endpoint: "/wallet/transactions/1",
    method: "patch",
    data: {
      type: "invalid",
      side: "credit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
    },
  });

  testInvalidOrMissingValue({
    name: "side (expenses)",
    type: "invalid",
    endpoint: "/wallet/transactions/1",
    method: "patch",
    data: {
      type: "expenses",
      side: "credit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
    },
  });

  testInvalidOrMissingValue({
    name: "side (income)",
    type: "invalid",
    endpoint: "/wallet/transactions/1",
    method: "patch",
    data: {
      type: "income",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
    },
  });

  testInvalidOrMissingValue({
    name: "particulars",
    type: "invalid",
    endpoint: "/wallet/transactions/1",
    method: "patch",
    data: {
      type: "expenses",
      side: "debit",
      particulars: 123,
      amount: 100,
      date: new Date().toISOString(),
    },
  });

  testInvalidOrMissingValue({
    name: "amount",
    type: "invalid",
    endpoint: "/wallet/transactions/1",
    method: "patch",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: "abc",
      date: new Date().toISOString(),
    },
  });

  testInvalidOrMissingValue({
    name: "date",
    type: "invalid",
    endpoint: "/wallet/transactions/1",
    method: "patch",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: "abc",
    },
  });

  testInvalidOrMissingValue({
    name: "category",
    type: "invalid",
    endpoint: "/wallet/transactions/1",
    method: "patch",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      category: "invalid",
    },
  });

  testInvalidOrMissingValue({
    name: "asset",
    type: "invalid",
    endpoint: "/wallet/transactions/1",
    method: "patch",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      asset: "invalid",
    },
  });

  testInvalidOrMissingValue({
    name: "ledger",
    type: "invalid",
    endpoint: "/wallet/transactions/1",
    method: "patch",
    data: {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
      ledger: "invalid",
    },
  });

  for (const field of ["type", "side", "particulars", "amount", "date"]) {
    const data = {
      type: "expenses",
      side: "debit",
      particulars: "~test",
      amount: 100,
      date: new Date().toISOString(),
    };

    delete data[field as keyof typeof data];

    testInvalidOrMissingValue({
      name: field,
      type: "missing",
      endpoint: "/wallet/transactions/1",
      method: "patch",
      data,
    });
  }

  testEntryNotFound("/wallet/transactions/1", "patch", {
    type: "expenses",
    side: "debit",
    particulars: "~test",
    amount: 100,
    date: new Date().toISOString(),
  });
});

describe("DELETE /wallet/transactions/:id", () => {
  postTestCleanup("wallet_transactions", "particulars");
  postTestCleanup("wallet_assets");
  postTestCleanup("wallet_categories");
  postTestCleanup("wallet_ledgers");

  testUnauthorized("/wallet/transactions/1", "delete");

  testEntryDeletion({
    name: "wallet transaction",
    endpoint: "/wallet/transactions",
    collection: "wallet_transactions",
    data: async () => {
      const { dummyCategory, dummyLedger, dummyAsset } =
        await createDummyData();

      return {
        type: "expenses",
        side: "debit",
        particulars: "~test",
        amount: 100,
        date: new Date().toISOString(),
        category: dummyCategory.id,
        asset: dummyAsset.id,
        ledger: dummyLedger.id,
      };
    },
  });

  testEntryNotFound("/wallet/transactions/1", "delete");
});
