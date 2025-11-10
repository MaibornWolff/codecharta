import { clickButtonOnPageElement } from "../../../../../puppeteer.helper"

export class MapTreeViewLevelPageObject {
    async openContextMenu(path: string) {
        await clickButtonOnPageElement(`[id='${path}']`, { button: "right" })
        await page.waitForSelector("#codemap-context-menu", { visible: true })
        await page.waitForSelector(".tree-element-label.marked")
    }

    async openFolder(path: string) {
        await clickButtonOnPageElement(`[id='${path}']`)
        await page.waitForSelector(`[id='${path}'] span.fa.fa-folder-open`)

        // Wait for children to be rendered in DOM after opening folder
        await page.waitForFunction(
            parentPath => {
                const elements = document.querySelectorAll(`[id^="${parentPath}/"]`)
                // Ensure elements exist and are visible (offsetParent is non-null for visible elements)
                if (elements.length === 0) return false
                for (const el of Array.from(elements)) {
                    const htmlEl = el as HTMLElement
                    if (!htmlEl.offsetParent) return false
                }
                return true
            },
            { timeout: 10000 },
            path
        )

        // Additional delay for Angular change detection and CSS layout to complete in CI
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    async hoverNode(path: string) {
        await page.waitForSelector(`[id='${path}']`)
        await page.hover(`[id='${path}']`)
        await page.waitForSelector(`[id='${path}'].hovered`)
    }

    async nodeExists(path: string) {
        return Boolean(await page.$(`[id='${path}']`))
    }

    async isNodeMarked(path: string) {
        return page.waitForSelector(`[id='${path}'].marked`)
    }

    async getNumberOfFiles(path: string) {
        return page.$eval(`[id='${path}'] .unary-number`, element => Number(element["innerText"].split(" ")[0]))
    }
}
