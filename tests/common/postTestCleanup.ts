import { afterAll } from "vitest";
import { PBClient } from "../utils/PBClient.js";

export async function postTestCleanup(collection: string, columnName = "name") {
  afterAll(async () => {
    const testEntries = await PBClient.collection(collection).getFullList({
      filter: `${columnName} ~ '~test' || ${columnName} ~ '~updated'`,
    });

    for (const entry of testEntries) {
      await PBClient.collection(collection)
        .delete(entry.id)
        .catch(() => {});
    }
  });
}
