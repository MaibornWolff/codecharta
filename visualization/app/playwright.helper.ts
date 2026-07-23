import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { chromium, expect, Page } from "@playwright/test"

// The built app is served over HTTP (see playwright.config.ts webServer) so each parallel browser
// context gets isolated, persistent origin storage — a file:// origin shares IndexedDB across all
// contexts, which makes the IndexedDB-restore tests flaky under parallel execution.
export const E2E_PORT = 9009
export const CC_URL = `http://localhost:${E2E_PORT}/`

// System Chrome instead of Playwright's bundled Chromium (bundled Chromium lacks WebGL support in
// headless mode on macOS). Google Chrome is not built for Linux arm64, so fall back to the bundled
// Chromium there — its headless WebGL works on Linux.
export const BROWSER_CHANNEL = process.platform === "linux" && process.arch === "arm64" ? "chromium" : "chrome"

export const E2E_VIEWPORT = { width: 1920, height: 1080 }
export const E2E_SLOW_MO = 25

/**
 * Runs a test callback on a page whose storage is backed by disk. A default Playwright context is
 * ephemeral, so Chrome keeps its IndexedDB in memory only, where the storage service can silently
 * drop it under load and strict-durability saves never reach a disk. Tests about data surviving a
 * reboot need this context — which is also the one real users of the persistence feature run in.
 */
export async function withDiskBackedPage(run: (page: Page) => Promise<void>) {
    const userDataDir = await mkdtemp(join(tmpdir(), "cc-e2e-"))
    const context = await chromium.launchPersistentContext(userDataDir, {
        channel: BROWSER_CHANNEL,
        viewport: E2E_VIEWPORT,
        slowMo: E2E_SLOW_MO
    })

    try {
        await run(context.pages()[0])
    } finally {
        await context.close()
        await rm(userDataDir, { recursive: true, force: true })
    }
}

export async function goto(page: Page, url = CC_URL) {
    await page.goto(url)
    // A bare "spinner hidden" wait passes trivially before Angular has booted, because the spinner
    // itself is Angular-rendered. Any rendered child proves the boot has started, and from then on
    // the spinner cannot be missed: loadOnBoot raises it synchronously, before its first await.
    await page.locator("cc-code-charta > *").first().waitFor({ state: "attached", timeout: 60_000 })
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
    // A page that never navigated (a test that manages its own context leaves the fixture page on
    // about:blank) has no origin storage, and clearDataForOrigin can hang on it.
    if (!page.url().startsWith("http")) {
        return
    }
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
    // page.evaluate is what makes this a real wait: waitForFunction does not await a promise the
    // predicate returns, so an async IndexedDB read there passes on the truthy promise object alone.
    await expect.poll(() => readPersistedFileNames(page), { timeout: 60_000, intervals: [200] }).toContain(expectedFileName)
}

function readPersistedFileNames(page: Page): Promise<string[]> {
    return page.evaluate(
        () =>
            new Promise<string[]>(resolve => {
                const open = indexedDB.open("CodeCharta")
                open.onsuccess = () => {
                    const database = open.result
                    if (!database.objectStoreNames.contains("ccstate")) {
                        database.close()
                        return resolve([])
                    }
                    const record = database.transaction("ccstate", "readonly").objectStore("ccstate").get(1001)
                    record.onsuccess = () => {
                        database.close()
                        const files = record.result?.state?.files ?? []
                        resolve(files.map((fileState: any) => fileState?.file?.fileMeta?.fileName))
                    }
                    record.onerror = () => {
                        database.close()
                        resolve([])
                    }
                }
                open.onerror = () => resolve([])
            })
    )
}
