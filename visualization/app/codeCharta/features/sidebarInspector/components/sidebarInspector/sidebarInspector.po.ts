import { Page } from "@playwright/test"

export class SidebarInspectorPageObject {
    private readonly DEFAULT_TIMEOUT = 15000

    constructor(private page: Page) {}

    async waitUntilOpen() {
        await this.page.locator("cc-sidebar-inspector:not(.translate-x-full)").waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })
    }

    async waitUntilClosed() {
        await this.page.locator("cc-sidebar-inspector.translate-x-full").waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })
    }

    async getNodeName() {
        return this.page.locator("[data-testid='inspector-node-name']").textContent()
    }

    async close() {
        await this.page.locator("[data-testid='inspector-close-button']").click()
    }
}
