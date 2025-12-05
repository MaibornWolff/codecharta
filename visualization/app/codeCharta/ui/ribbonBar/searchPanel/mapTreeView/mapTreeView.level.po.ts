import { clickButtonOnPageElement } from "../../../../../puppeteer.helper"

export class MapTreeViewLevelPageObject {
    private readonly DEFAULT_TIMEOUT = 15000

    async openContextMenu(path: string) {
        const selector = `[id='${path}']`
        await page.waitForSelector(selector, { visible: true, timeout: this.DEFAULT_TIMEOUT })

        // Ensure element is in viewport before clicking
        await this.scrollElementIntoView(selector)

        await clickButtonOnPageElement(selector, { button: "right" })
        await page.waitForSelector("#codemap-context-menu", { visible: true, timeout: this.DEFAULT_TIMEOUT })
        await page.waitForSelector(".tree-element-label.marked", { timeout: this.DEFAULT_TIMEOUT })
    }

    async openFolder(path: string) {
        const selector = `[id='${path}']`
        await page.waitForSelector(selector, { visible: true, timeout: this.DEFAULT_TIMEOUT })

        // Ensure element is in viewport before clicking
        await this.scrollElementIntoView(selector)

        await clickButtonOnPageElement(selector)
        await page.waitForSelector(`${selector} span.fa.fa-folder-open`, { timeout: this.DEFAULT_TIMEOUT })

        // Wait for children to be rendered in DOM after opening folder
        await page.waitForFunction(
            parentPath => {
                const elements = document.querySelectorAll(`[id^="${parentPath}/"]`)
                if (elements.length === 0) {
                    return false
                }
                // Check that at least one child element exists and has non-zero dimensions
                for (const el of Array.from(elements)) {
                    const rect = el.getBoundingClientRect()
                    if (rect.width > 0 && rect.height > 0) {
                        return true
                    }
                }
                return false
            },
            { timeout: this.DEFAULT_TIMEOUT },
            path
        )

        // Allow time for Angular change detection and CSS transitions to complete
        await new Promise(resolve => setTimeout(resolve, 150))
    }

    async hoverNode(path: string) {
        const selector = `[id='${path}']`
        await page.waitForSelector(selector, { visible: true, timeout: this.DEFAULT_TIMEOUT })

        // Ensure element is in viewport before hovering
        await this.scrollElementIntoView(selector)

        await page.hover(selector)
        await page.waitForSelector(`${selector}.hovered`, { timeout: this.DEFAULT_TIMEOUT })
    }

    async nodeExists(path: string) {
        return Boolean(await page.$(`[id='${path}']`))
    }

    async isNodeMarked(path: string) {
        return page.waitForSelector(`[id='${path}'].marked`, { timeout: this.DEFAULT_TIMEOUT })
    }

    async hasMarkedClass(path: string): Promise<boolean> {
        const selector = `[id='${path}']`
        const element = await page.$(selector)
        if (!element) {
            return false
        }
        const classNames = await page.$eval(selector, el => el.className)
        return classNames.includes("marked")
    }

    async hoverNodeWithoutScrolling(path: string) {
        const selector = `[id='${path}']`
        await page.waitForSelector(selector, { visible: true, timeout: this.DEFAULT_TIMEOUT })
        await page.hover(selector)
    }

    async getNumberOfFiles(path: string) {
        return page.$eval(`[id='${path}'] .unary-number`, element => Number(element["innerText"].split(" ")[0]))
    }

    private async scrollElementIntoView(selector: string) {
        await page.$eval(selector, element => {
            element.scrollIntoView({ block: "center", behavior: "instant" })
        })
        // Small delay to ensure scroll completes
        await new Promise(resolve => setTimeout(resolve, 50))
    }
}
