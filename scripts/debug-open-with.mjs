import { chromium } from "playwright";

const url =
  "http://127.0.0.1:8888/lab?token=a6a55932ec8856ab4ec10a8ab876c7f08154b6c2d724fac7";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];

page.on("pageerror", (err) => errors.push(String(err)));

await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForSelector("#jupyterlab-splash", { state: "hidden", timeout: 120000 }).catch(() => {});
await page.waitForTimeout(3000);

const example = page.locator(".jp-DirListing-item").filter({ hasText: "example.ipynb" }).first();
await example.click({ button: "right", timeout: 10000 });
await page.waitForTimeout(500);

const openWith = page.getByText("Open With", { exact: true });
console.log("Open With visible:", await openWith.isVisible().catch(() => false));

if (await openWith.isVisible().catch(() => false)) {
  await openWith.hover();
  await page.waitForTimeout(500);
  const items = await page.locator(".lm-Menu-itemLabel").allTextContents();
  console.log("Menu items:", items.filter(Boolean));
  const lumen = page.getByText("Lumen Mind Map", { exact: true });
  if (await lumen.isVisible().catch(() => false)) {
    await lumen.click();
    await page.waitForTimeout(4000);
  }
}

console.log("Mind map count:", await page.locator(".jp-LumenNotebookMindMap").count());
console.log("Errors:", errors);

await browser.close();
