import { chromium } from "playwright";

const url =
  "http://127.0.0.1:8888/lab?token=a6a55932ec8856ab4ec10a8ab876c7f08154b6c2d724fac7";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(4000);

await page
  .locator(".jp-DirListing-item")
  .filter({ hasText: "example.ipynb" })
  .first()
  .dblclick();
await page.waitForTimeout(2000);

await page.locator('[data-command="jupyterlab-lumen:open-notebook-mindmap"]').click();
await page.waitForTimeout(4000);

const mindMap = page.locator(".jp-LumenNotebookMindMap");
console.log("mind map:", await mindMap.count());

const dragHandles = await page.locator(".jp-LumenNotebookMindMap-dragHandle").count();
const editors = await page.locator(".jp-LumenNotebookMindMap .jp-CodeMirror").count();
const renderedMarkdown = await page
  .locator(".jp-LumenNotebookMindMap .jp-MarkdownOutput")
  .count();

console.log("drag handles:", dragHandles);
console.log("codemirror editors:", editors);
console.log("markdown rendered outputs:", renderedMarkdown);

await browser.close();
