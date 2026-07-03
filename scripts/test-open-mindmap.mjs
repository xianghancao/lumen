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
await page.waitForSelector("#jupyterlab-splash", { state: "hidden", timeout: 120000 }).catch(() => {});

await page.waitForTimeout(3000);

const activated = logs.some((l) => l.includes("jupyterlab-lumen: refactor extension activated"));
console.log("Extension activated:", activated);

await page.getByRole("button", { name: "File Browser" }).click({ timeout: 10000 }).catch(() => {});
await page.waitForTimeout(1000);

const example = page.locator(".jp-DirListing-item").filter({ hasText: "example.ipynb" }).first();
await example.click({ button: "right", timeout: 10000 });
await page.waitForTimeout(500);

const openWith = page.getByText("Open With", { exact: true });
const hasOpenWith = await openWith.isVisible().catch(() => false);
console.log("Open With visible:", hasOpenWith);

if (hasOpenWith) {
  await openWith.hover();
  await page.waitForTimeout(500);
  const lumen = page.getByText("Lumen Mind Map", { exact: true });
  const hasLumen = await lumen.isVisible().catch(() => false);
  console.log("Lumen Mind Map visible:", hasLumen);
  if (hasLumen) {
    await lumen.click();
    await page.waitForTimeout(5000);
  }
}

const mindMap = page.locator(".jp-LumenNotebookMindMap");
const mindMapCount = await mindMap.count();
console.log("Mind map widgets:", mindMapCount);

const tabs = await page.locator(".lm-TabBar-tab").allTextContents();
console.log("Tabs:", tabs);

console.log("\nPage errors:");
errors.forEach((e) => console.log(e));
console.log("\nRelevant logs:");
logs
  .filter(
    (l) =>
      l.toLowerCase().includes("lumen") ||
      l.toLowerCase().includes("error") ||
      l.toLowerCase().includes("failed"),
  )
  .forEach((l) => console.log(l));

await browser.close();
