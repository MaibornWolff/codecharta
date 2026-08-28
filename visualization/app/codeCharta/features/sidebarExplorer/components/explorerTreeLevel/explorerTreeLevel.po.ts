import { Locator, Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../../../playwright.helper"
import { explorerRowId } from "../../explorerRowId"
import { ExplorerStorageScope } from "../../explorerStorageScope"

export class ExplorerTreeLevelPageObject {
    private readonly DEFAULT_TIMEOUT = 15000

    constructor(
        private page: Page,
        private scope: ExplorerStorageScope = "metrics"
    ) {}

    private rowSelector(path: string) {
        return `[id='${explorerRowId(this.scope, path)}']`
    }

    async openContextMenu(path: string) {
        const selector = this.rowSelector(path)
        await this.page.locator(selector).waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        await this.scrollElementIntoView(selector)
        await clickButtonOnPageElement(this.page, selector, { button: "right" })
        await this.page.locator("#codemap-context-menu").waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        await this.page.locator(".tree-element-label.marked").waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })
    }

    async openFolder(path: string) {
        const selector = this.rowSelector(path)
        await this.page.locator(selector).waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        await this.scrollElementIntoView(selector)
        await clickButtonOnPageElement(this.page, selector)
        await this.page.locator(`${selector} span.fa.fa-folder-open`).waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })

        await this.page.waitForFunction(
            parentRowId => {
                const elements = document.querySelectorAll(`[id^="${parentRowId}/"]`)
                if (elements.length === 0) {
                    return false
                }
                for (const el of Array.from(elements)) {
                    const rect = el.getBoundingClientRect()
                    if (rect.width > 0 && rect.height > 0) {
                        return true
                    }
                }
                return false
            },
            explorerRowId(this.scope, path),
            { timeout: this.DEFAULT_TIMEOUT }
        )

        await this.page.waitForTimeout(150)
    }

    async selectNode(path: string) {
        const selector = this.rowSelector(path)
        await this.page.locator(selector).waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        await this.scrollElementIntoView(selector)
        await clickButtonOnPageElement(this.page, selector)
    }

    async hoverNode(path: string) {
        const selector = this.rowSelector(path)
        await this.page.locator(selector).waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        await this.scrollElementIntoView(selector)
        await this.page.locator(selector).hover()
        await this.page.locator(`${selector}.hovered`).waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })
    }

    node(path: string): Locator {
        return this.page.locator(this.rowSelector(path))
    }

    async isNodeMarked(path: string) {
        return this.page.locator(`${this.rowSelector(path)}.marked`).waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })
    }

    async hasMarkedClass(path: string): Promise<boolean> {
        const selector = this.rowSelector(path)
        const count = await this.page.locator(selector).count()
        if (count === 0) {
            return false
        }
        const classNames = await this.page.locator(selector).getAttribute("class")
        return classNames?.includes("marked") ?? false
    }

    async hoverNodeWithoutScrolling(path: string) {
        const selector = this.rowSelector(path)
        await this.page.locator(selector).waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        await this.page.locator(selector).hover({ force: true })
    }

    private async scrollElementIntoView(selector: string) {
        await this.page.locator(selector).evaluate(element => {
            element.scrollIntoView({ block: "center", behavior: "instant" })
        })
        await this.page.waitForTimeout(50)
    }
}
