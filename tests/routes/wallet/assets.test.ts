import { describe } from "vitest";
import { WalletAssetSchema } from "../../../src/interfaces/wallet_interfaces.js";
import testUnauthorized from "../../common/testUnauthorized.js";
import testList from "../../common/testList.js";
import testEntryCreation from "../../common/testEntryCreation.js";
import testInvalidOrMissingValue from "../../common/testInvalidOrMissingValue.js";
import testEntryNotFound from "../../common/testEntryNotFound.js";
import testEntryDeletion from "../../common/testEntryDeletion.js";
import testEntryModification from "../../common/testEntryModification.js";
import { postTestCleanup } from "../../common/postTestCleanup.js";

describe("GET /wallet/assets", () => {
  testUnauthorized("/wallet/assets", "get");
  testList("/wallet/assets", WalletAssetSchema, "wallet asset");
});

describe("POST /wallet/assets", () => {
  postTestCleanup("wallet_assets");

  testUnauthorized("/wallet/assets", "post");

  testEntryCreation({
    name: "wallet asset",
    endpoint: "/wallet/assets",
    schema: WalletAssetSchema,
    collection: "wallet_assets",
    data: {
      name: "~test",
      icon: "test-icon",
      starting_balance: 1000,
    },
  });

  testInvalidOrMissingValue({
    name: "name",
    type: "invalid",
    endpoint: "/wallet/assets",
    method: "post",
    data: {
      name: 123,
      icon: "test-icon",
      starting_balance: 1000,
    },
  });

  testInvalidOrMissingValue({
    name: "icon",
    type: "invalid",
    endpoint: "/wallet/assets",
    method: "post",
    data: {
      name: "~test",
      icon: 123,
      starting_balance: 1000,
    },
  });

  testInvalidOrMissingValue({
    name: "starting_balance",
    type: "invalid",
    endpoint: "/wallet/assets",
    method: "post",
    data: {
      name: "~test",
      icon: "test-icon",
      starting_balance: "abc",
    },
  });

  for (const key of ["name", "icon", "starting_balance"]) {
    const data = {
      name: "~test",
      icon: "test-icon",
      starting_balance: 1000,
    };

    delete data[key as keyof typeof data];

    testInvalidOrMissingValue({
      name: key,
      type: "missing",
      endpoint: "/wallet/assets",
      method: "post",
      data,
    });
  }
});

describe("PATCH /wallet/assets/:id", () => {
  postTestCleanup("wallet_assets");

  testUnauthorized("/wallet/assets/123", "patch");

  testEntryModification({
    name: "wallet asset",
    endpoint: "/wallet/assets",
    schema: WalletAssetSchema,
    collection: "wallet_assets",
    oldData: {
      name: "~test",
      icon: "test-icon",
      starting_balance: 1000,
    },
    newData: {
      name: "~updated",
      icon: "updated-icon",
      starting_balance: 2000,
    },
  });

  testInvalidOrMissingValue({
    name: "name",
    type: "invalid",
    endpoint: "/wallet/assets/123",
    method: "patch",
    data: {
      name: 123,
      icon: "updated-icon",
      starting_balance: 2000,
    },
  });

  testInvalidOrMissingValue({
    name: "icon",
    type: "invalid",
    endpoint: "/wallet/assets/123",
    method: "patch",
    data: {
      name: "~updated",
      icon: 123,
      starting_balance: 2000,
    },
  });

  testInvalidOrMissingValue({
    name: "starting_balance",
    type: "invalid",
    endpoint: "/wallet/assets/123",
    method: "patch",
    data: {
      name: "~updated",
      icon: "updated-icon",
      starting_balance: "abc",
    },
  });

  for (const key of ["name", "icon", "starting_balance"]) {
    const data = {
      name: "~updated",
      icon: "updated-icon",
      starting_balance: 2000,
    };

    delete data[key as keyof typeof data];

    testInvalidOrMissingValue({
      name: key,
      type: "missing",
      endpoint: "/wallet/assets/123",
      method: "patch",
      data,
    });
  }

  testEntryNotFound("/wallet/assets/123", "patch", {
    name: "~updated",
    icon: "updated-icon",
    starting_balance: 2000,
  });
});

describe("DELETE /wallet/assets/:id", () => {
  postTestCleanup("wallet_assets");

  testUnauthorized("/wallet/assets/123", "delete");

  testEntryDeletion({
    name: "wallet asset",
    endpoint: "/wallet/assets",
    collection: "wallet_assets",
    data: {
      name: "~test",
      icon: "test-icon",
      starting_balance: 1000,
    },
  });

  testEntryNotFound("/wallet/assets/123", "delete");
});
