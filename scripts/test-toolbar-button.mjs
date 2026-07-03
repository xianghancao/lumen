import { chromium } from "playwright";

const url =
  "http://127.0.0.1:8888/lab?token=a6a55932ec8856ab4ec10a8ab876c7f08154b6c2d724fac7";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const logs = [];
const errors = [];

page.on("console", (msg) => {
  logs.push(`[${msg.type()}] ${msg.text()}`);
});
page.on("pageerror", (err) => {
  errors.push(String(err));
});

await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page
  .waitForSelector("#jupyterlab-splash", { state: "hidden", timeout: 120000 })
  .catch(() => {});
await page.waitForTimeout(3000);

const example = page
  .locator(".jp-DirListing-item")
  .filter({ hasText: "example.ipynb" })
  .first();
await example.dblclick({ timeout: 10000 });
await page.waitForTimeout(3000);

const toolbarBtn = page.locator(
  '.jp-NotebookPanel-toolbar [data-command="jupyterlab-lumen:open-notebook-mindmap"]',
);
const btnCount = await toolbarBtn.count();
console.log("Toolbar button count:", btnCount);

if (btnCount > 0) {
  const disabled = await toolbarBtn.first().isDisabled();
  const ariaDisabled = await toolbarBtn.first().getAttribute("aria-disabled");
  console.log("Button disabled:", disabled, "aria-disabled:", ariaDisabled);
  await toolbarBtn.first().click({ timeout: 5000 });
  await page.waitForTimeout(5000);
}

const mindMapCount = await page.locator(".jp-LumenNotebookMindMap").count();
console.log("Mind map widgets:", mindMapCount);
console.log(
  "Tabs:",
  await page.locator(".lm-TabBar-tab").allTextContents(),
);

console.log("\nPage errors:");
errors.forEach((e) => console.log(e));
console.log("\nRelevant logs:");
logs
  .filter((l) => /lumen|error|failed|mind/i.test(l))
  .forEach((l) => console.log(l));

await browser.close();
