import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { layoutOutlineTree } from "./layout";
import { buildNotebookOutline } from "./notebook-outline";
import { md } from "./test-helpers";

describe("layoutOutlineTree", () => {
  it("returns positions for visible outline nodes", () => {
    const root = buildNotebookOutline([
      md("# Root"),
      md("## Child"),
    ]);
    const positions = layoutOutlineTree(root, {
      direction: "LR",
      density: "normal",
    });
    const byId = new Map(positions.map((position) => [position.id, position]));

    assert.ok(byId.get("cell-0"));
    assert.ok(byId.get("cell-1"));
    assert.equal(byId.get("cell-0")!.width > 0, true);
    assert.equal(byId.get("cell-1")!.x > byId.get("cell-0")!.x, true);
  });

  it("increases parent-child distance when child gap grows", () => {
    const root = buildNotebookOutline([
      md("# Root"),
      md("## Child"),
    ]);
    const compact = layoutOutlineTree(root, {
      direction: "LR",
      density: "normal",
      childGap: 24,
    });
    const loose = layoutOutlineTree(root, {
      direction: "LR",
      density: "normal",
      childGap: 96,
    });
    const compactChild = compact.find((position) => position.id === "cell-1")!;
    const looseChild = loose.find((position) => position.id === "cell-1")!;

    assert.ok(looseChild.x > compactChild.x);
  });
});
