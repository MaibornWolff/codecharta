import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../../../playwright.helper"

export class MapTreeViewLevelPageObject {
    private readonly DEFAULT_TIMEOUT = 15000

    constructor(private page: Page) {}

    async openContextMenu(path: string) {
        const selector = `[id='${path}']`
        await this.page.locator(selector).waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        await this.scrollElementIntoView(selector)
        await clickButtonOnPageElement(this.page, selector, { button: "right" })
        await this.page.locator("#codemap-context-menu").waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        await this.page.locator(".tree-element-label.marked").waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })
    }

    async openFolder(path: string) {
        const selector = `[id='${path}']`
        await this.page.locator(selector).waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        await this.scrollElementIntoView(selector)
        await clickButtonOnPageElement(this.page, selector)
        await this.page.locator(`${selector} span.fa.fa-folder-open`).waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })

        await this.page.waitForFunction(
            parentPath => {
                const elements = document.querySelectorAll(`[id^="${parentPath}/"]`)
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
            path,
            { timeout: this.DEFAULT_TIMEOUT }
        )

        await this.page.waitForTimeout(150)
    }

    async hoverNode(path: string) {
        const selector = `[id='${path}']`
        await this.page.locator(selector).waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        await this.scrollElementIntoView(selector)
        await this.page.locator(selector).hover()
        await this.page.locator(`${selector}.hovered`).waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })
    }

    async nodeExists(path: string) {
        const count = await this.page.locator(`[id='${path}']`).count()
        return count > 0
    }

    async isNodeMarked(path: string) {
        return this.page.locator(`[id='${path}'].marked`).waitFor({ state: "attached", timeout: this.DEFAULT_TIMEOUT })
    }

    async hasMarkedClass(path: string): Promise<boolean> {
        const selector = `[id='${path}']`
        const count = await this.page.locator(selector).count()
        if (count === 0) {
            return false
        }
        const classNames = await this.page.locator(selector).getAttribute("class")
        return classNames?.includes("marked") ?? false
    }

    async hoverNodeWithoutScrolling(path: string) {
        const selector = `[id='${path}']`
        await this.page.locator(selector).waitFor({ state: "visible", timeout: this.DEFAULT_TIMEOUT })
        // Use force to bypass actionability checks when context menu might overlay
        await this.page.locator(selector).hover({ force: true })
    }

    async getNumberOfFiles(path: string) {
        const text = await this.page.locator(`[id='${path}'] .unary-number`).innerText()
        return Number(text.split(" ")[0])
    }

    private async scrollElementIntoView(selector: string) {
        await this.page.locator(selector).evaluate(element => {
            element.scrollIntoView({ block: "center", behavior: "instant" })
        })
        await this.page.waitForTimeout(50)
    }
}
