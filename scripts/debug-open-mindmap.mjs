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
await page.waitForTimeout(4000);

console.log(
  "Extension activated:",
  logs.some((l) => l.includes("jupyterlab-lumen: refactor extension activated")),
);

await page.getByRole("button", { name: "File Browser" }).click({ timeout: 10000 }).catch(() => {});
await page.waitForTimeout(1000);

const example = page
  .locator(".jp-DirListing-item")
  .filter({ hasText: "example.ipynb" })
  .first();
await example.dblclick({ timeout: 10000 });
await page.waitForTimeout(3000);

const toolbarBtn = page.locator(
  '[data-command="jupyterlab-lumen:open-notebook-mindmap"]',
);
console.log("Toolbar buttons:", await toolbarBtn.count());
if ((await toolbarBtn.count()) > 0) {
  console.log("Toolbar disabled:", await toolbarBtn.first().isDisabled());
  await toolbarBtn.first().click({ timeout: 5000 });
  await page.waitForTimeout(4000);
}

let mindMapCount = await page.locator(".jp-LumenNotebookMindMap").count();
console.log("Mind map after toolbar click:", mindMapCount);

if (mindMapCount === 0) {
  await example.click({ button: "right", timeout: 10000 });
  await page.waitForTimeout(500);
  const openWith = page.getByText("Open With", { exact: true });
  console.log("Open With visible:", await openWith.isVisible().catch(() => false));
  if (await openWith.isVisible().catch(() => false)) {
    await openWith.hover();
    await page.waitForTimeout(500);
    const lumen = page.getByText("Lumen Mind Map", { exact: true });
    console.log("Lumen in menu:", await lumen.isVisible().catch(() => false));
    if (await lumen.isVisible().catch(() => false)) {
      await lumen.click();
      await page.waitForTimeout(4000);
    }
  }
}

mindMapCount = await page.locator(".jp-LumenNotebookMindMap").count();
console.log("Mind map final count:", mindMapCount);
console.log("Tabs:", await page.locator(".lm-TabBar-tab").allTextContents());

console.log("\nPage errors:");
errors.forEach((e) => console.log(e));
console.log("\nRelevant logs:");
logs
  .filter((l) => /lumen|error|failed|mind|open/i.test(l))
  .slice(-40)
  .forEach((l) => console.log(l));

await browser.close();
