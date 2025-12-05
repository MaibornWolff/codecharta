import path from "path"
import { Page } from "@playwright/test"

export const CC_URL = `file:${path.join(__dirname, "../dist/bundler/browser/index.html")}`

export async function goto(page: Page, url = CC_URL) {
    await page.goto(url)
    // Wait for loading to complete - the gif might already be hidden if loading is fast
    await page.locator("#loading-gif-file").waitFor({ state: "hidden", timeout: 60_000 })
}

export async function clickButtonOnPageElement(page: Page, selector: string, options?: { button?: "left" | "right" }) {
    await page.locator(selector).waitFor({ state: "visible", timeout: 10_000 })
    await page.locator(selector).click({ button: options?.button ?? "left" })
}

export async function clearIndexedDB(page: Page) {
    const client = await page.context().newCDPSession(page)
    await client.send("Storage.clearDataForOrigin", {
        origin: page.url(),
        storageTypes: "indexeddb"
    })
}
