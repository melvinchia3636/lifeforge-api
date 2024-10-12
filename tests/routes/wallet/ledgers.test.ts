import { describe } from "vitest";
import { WalletLedgerSchema } from "../../../src/interfaces/wallet_interfaces.js";
import testUnauthorized from "../../common/testUnauthorized.js";
import testEntryList from "../../common/testEntryList.js";
import testEntryCreation from "../../common/testEntryCreation.js";
import testInvalidOrMissingValue from "../../common/testInvalidOrMissingValue.js";
import testEntryNotFound from "../../common/testEntryNotFound.js";
import testEntryDeletion from "../../common/testEntryDeletion.js";
import testEntryModification from "../../common/testEntryModification.js";
import { postTestCleanup } from "../../common/postTestCleanup.js";

describe("GET /wallet/ledgers", () => {
  testUnauthorized("/wallet/ledgers", "get");
  testEntryList({
    endpoint: "/wallet/ledgers",
    schema: WalletLedgerSchema,
    name: "wallet ledger",
  });
});

describe("POST /wallet/ledgers", () => {
  postTestCleanup("wallet_ledgers");

  testUnauthorized("/wallet/ledgers", "post");

  testEntryCreation({
    name: "wallet ledger",
    endpoint: "/wallet/ledgers",
    schema: WalletLedgerSchema,
    collection: "wallet_ledgers",
    data: {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    },
  });

  testInvalidOrMissingValue({
    name: "name",
    type: "invalid",
    endpoint: "/wallet/ledgers",
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
    endpoint: "/wallet/ledgers",
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
    endpoint: "/wallet/ledgers",
    method: "post",
    data: {
      name: "~test",
      icon: "test-icon",
      color: "not a color hex",
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
      endpoint: "/wallet/ledgers",
      method: "post",
      data,
    });
  }
});

describe("PATCH /wallet/ledgers/:id", () => {
  postTestCleanup("wallet_ledgers");

  testUnauthorized("/wallet/ledgers/123", "patch");

  testEntryModification({
    name: "wallet ledger",
    endpoint: "/wallet/ledgers",
    schema: WalletLedgerSchema,
    collection: "wallet_ledgers",
    oldData: {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    },
    newData: {
      name: "~updated",
      icon: "updated-icon",
      color: "#ffffff",
    },
  });

  testInvalidOrMissingValue({
    name: "name",
    type: "invalid",
    endpoint: "/wallet/ledgers/123",
    method: "patch",
    data: {
      name: 123,
      icon: "updated-icon",
      color: "#ffffff",
    },
  });

  testInvalidOrMissingValue({
    name: "icon",
    type: "invalid",
    endpoint: "/wallet/ledgers/123",
    method: "patch",
    data: {
      name: "~updated",
      icon: 123,
      color: "#ffffff",
    },
  });

  testInvalidOrMissingValue({
    name: "color",
    type: "invalid",
    endpoint: "/wallet/ledgers/123",
    method: "patch",
    data: {
      name: "~updated",
      icon: "updated-icon",
      color: "not a color hex",
    },
  });

  for (const key of ["name", "icon", "color"]) {
    const data = {
      name: "~updated",
      icon: "updated-icon",
      color: "#ffffff",
    };

    delete data[key as keyof typeof data];

    testInvalidOrMissingValue({
      name: key,
      type: "missing",
      endpoint: "/wallet/ledgers/123",
      method: "patch",
      data,
    });
  }

  testEntryNotFound("/wallet/ledgers/123", "patch", {
    name: "~updated",
    icon: "updated-icon",
    color: "#ffffff",
    type: "income",
  });
});

describe("DELETE /wallet/ledgers/:id", () => {
  postTestCleanup("wallet_ledgers");

  testUnauthorized("/wallet/ledgers/123", "delete");

  testEntryDeletion({
    name: "wallet ledger",
    endpoint: "/wallet/ledgers",
    collection: "wallet_ledgers",
    data: {
      name: "~test",
      icon: "test-icon",
      color: "#000000",
    },
  });

  testEntryNotFound("/wallet/ledgers/123", "delete");
});
