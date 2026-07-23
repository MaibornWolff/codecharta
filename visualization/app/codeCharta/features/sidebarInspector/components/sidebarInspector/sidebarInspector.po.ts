import { Locator, Page } from "@playwright/test"

export class SidebarInspectorPageObject {
    private readonly DEFAULT_TIMEOUT = 15000

    constructor(private page: Page) {}

    async waitUntilOpen() {
        await this.page.locator("cc-sidebar-inspector:not(.translate-x-full)").waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })
    }

    async waitUntilClosed() {
        await this.page.locator("cc-sidebar-inspector.translate-x-full").waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })
    }

    /**
     * The inspector's node-name element. Use with a web-first assertion
     * (`await expect(po.nodeName()).toHaveText(…)`) rather than reading the text: the inspector's
     * content fills in a tick after it slides open, so a plain read races it.
     */
    nodeName(): Locator {
        return this.page.locator("[data-testid='inspector-node-name']")
    }

    async close() {
        await this.page.locator("[data-testid='inspector-close-button']").click()
    }
}
