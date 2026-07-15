import { Page } from "@playwright/test"

// The built app is served over HTTP (see playwright.config.ts webServer) so each parallel browser
// context gets isolated, persistent origin storage — a file:// origin shares IndexedDB across all
// contexts, which makes the IndexedDB-restore tests flaky under parallel execution.
export const E2E_PORT = 9009
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}/`
export const CC_URL = E2E_BASE_URL

export async function goto(page: Page, url = CC_URL) {
    await page.goto(url)
    // Wait for loading to complete - the gif might already be hidden if loading is fast
    await page.locator("#loading-gif-file").waitFor({ state: "hidden", timeout: 60_000 })
}

export async function clickButtonOnPageElement(page: Page, selector: string, options?: { button?: "left" | "right" }) {
    await page.locator(selector).waitFor({ state: "visible", timeout: 10_000 })
    await page.locator(selector).click({ button: options?.button ?? "left" })
}

export async function collapseExplorer(page: Page) {
    await page.getByTestId("explorer-collapse-button").click()
}

export async function clearIndexedDB(page: Page) {
    const client = await page.context().newCDPSession(page)
    await client.send("Storage.clearDataForOrigin", {
        origin: page.url(),
        storageTypes: "indexeddb"
    })
}

/**
 * Waits until the app has PERSISTED a specific loaded file to IndexedDB. The save is done by a
 * debounced effect, so a reload right after `goto()` (which only waits for the render) can outrace the
 * write and boot from a stale database.
 *
 * It waits for `expectedFileName` specifically, not just "any files": IndexedDB may still hold a prior
 * boot's persisted state, so a "files exist" check would be satisfied by that stale record and never
 * actually wait for this test's save. Waiting for the file this test just loaded is immune to both the
 * stale record and machine speed.
 *
 * Mirrors the constants in stores/rootStore/indexedDB/indexedDBWriter.ts (DB "CodeCharta", store
 * "ccstate", key 1001, record shape { id, state }); the persisted file name is
 * `state.files[].file.fileMeta.fileName`.
 */
export async function waitForCcStatePersisted(page: Page, expectedFileName: string) {
    await page.waitForFunction(
        (name: string) =>
            new Promise<boolean>(resolve => {
                const open = indexedDB.open("CodeCharta")
                open.onsuccess = () => {
                    const database = open.result
                    if (!database.objectStoreNames.contains("ccstate")) {
                        database.close()
                        return resolve(false)
                    }
                    const record = database.transaction("ccstate", "readonly").objectStore("ccstate").get(1001)
                    record.onsuccess = () => {
                        database.close()
                        const files = record.result?.state?.files ?? []
                        resolve(files.some((fileState: any) => fileState?.file?.fileMeta?.fileName === name))
                    }
                    record.onerror = () => {
                        database.close()
                        resolve(false)
                    }
                }
                open.onerror = () => resolve(false)
            }),
        expectedFileName,
        { timeout: 60_000, polling: 200 }
    )
}
