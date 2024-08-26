import { clickButtonOnPageElement } from "../../../../../puppeteer.helper"

export class SearchPanelModeSelectorPageObject {
    async toggleTreeView() {
        const wasOpen = await this.isTreeViewOpen()
        await clickButtonOnPageElement("#tree-view")

        await (wasOpen
            ? page.waitForSelector(".search-panel-card", { visible: false })
            : page.waitForSelector(".search-panel-card.expanded"))

        return !wasOpen
    }

    async isTreeViewOpen() {
        await page.waitForSelector("#tree-view")
        const treeViewClassNames = await page.$eval("#tree-view", element => element.className)

        await page.waitForSelector(".search-panel-card")
        const searchPanelClassNames = await page.$eval(".search-panel-card", element => element.className)

        return treeViewClassNames.includes("current") && searchPanelClassNames.includes("expanded")
    }

    async toggleBlacklistView() {
        await page.waitForSelector("#blacklist", { visible: true }).then(async element => element.click())
        await page.waitForTimeout(500)
    }
}
