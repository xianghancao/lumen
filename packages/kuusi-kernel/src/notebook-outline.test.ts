import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LEGACY_CELL_METADATA_KEY } from "./node-frame";
import { buildNotebookOutline, parseMarkdownHeading } from "./notebook-outline";
import { code, md } from "./test-helpers";

const collectIds = (node: ReturnType<typeof buildNotebookOutline>): string[] => {
  const ids: string[] = [];

  const visit = (current: typeof node) => {
    if (current.id !== "root") {
      ids.push(current.id);
    }

    current.children.forEach(visit);
  };

  visit(node);
  return ids;
};

describe("parseMarkdownHeading", () => {
  it("parses level and title", () => {
    assert.deepEqual(parseMarkdownHeading("# Root"), {
      level: 1,
      title: "Root",
    });
    assert.deepEqual(parseMarkdownHeading("###   Nested topic"), {
      level: 3,
      title: "Nested topic",
    });
  });

  it("returns null for non-heading markdown", () => {
    assert.equal(parseMarkdownHeading("plain text"), null);
    assert.equal(parseMarkdownHeading(""), null);
  });
});

describe("buildNotebookOutline", () => {
  it("builds a heading hierarchy under the virtual root", () => {
    const root = buildNotebookOutline([
      md("# Root"),
      md("## Section A"),
      code("print(1)"),
      md("## Section B"),
    ]);

    assert.deepEqual(collectIds(root), [
      "cell-0",
      "cell-1",
      "cell-2",
      "cell-3",
    ]);
    assert.equal(root.children[0]?.title, "Root");
    assert.equal(root.children[0]?.children[0]?.title, "Section A");
    assert.equal(root.children[0]?.children[0]?.children[0]?.id, "cell-2");
    assert.equal(root.children[0]?.children[1]?.title, "Section B");
  });

  it("ignores content before the first H1", () => {
    const root = buildNotebookOutline([
      md("orphan intro"),
      md("## orphan section"),
      md("# Real root"),
    ]);

    assert.deepEqual(collectIds(root), ["cell-2"]);
    assert.equal(root.children[0]?.title, "Real root");
  });

  it("uses metadata heading level for empty markdown cells", () => {
    const root = buildNotebookOutline([
      md("# Root"),
      md("", { kuusi: { headingLevel: 2 } }),
      md("", { kuusi: { headingLevel: 3 } }),
    ]);

    assert.equal(root.children[0]?.children[0]?.headingLevel, 2);
    assert.equal(root.children[0]?.children[0]?.title, "");
    assert.equal(root.children[0]?.children[0]?.children[0]?.headingLevel, 3);
    assert.equal(root.children[0]?.children[0]?.children[0]?.title, "");
  });

  it("reads legacy pre-rebrand cell metadata", () => {
    const root = buildNotebookOutline([
      md("# Root"),
      md("", { [LEGACY_CELL_METADATA_KEY]: { headingLevel: 2 } }),
    ]);

    assert.equal(root.children[0]?.children[0]?.headingLevel, 2);
  });

  it("prefers markdown heading over metadata level", () => {
    const root = buildNotebookOutline([
      md("# Root"),
      md("## From markdown", { kuusi: { headingLevel: 4 } }),
    ]);

    assert.equal(root.children[0]?.children[0]?.headingLevel, 2);
    assert.equal(root.children[0]?.children[0]?.title, "From markdown");
  });
});
