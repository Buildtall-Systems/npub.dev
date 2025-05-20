import { expect, it } from "vitest";
import { db } from "./db";

it("has expected tables", () => {
  const names = db.tables.map((t) => t.name);
  expect(names).toContain("kind0");
  expect(names).toContain("kind10002");
  expect(names).toContain("nip11");
});
