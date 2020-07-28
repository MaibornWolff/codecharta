export class SearchPanelModeSelectorPageObject {
	public async toggleTreeView() {
		const wasOpen = await this.isTreeViewOpen()

		await expect(page).toClick("#tree-view", { timeout: 3000 })

		if (wasOpen) {
			await page.waitForSelector("#search-panel-card", { visible: false })
		} else {
			await page.waitForSelector("#search-panel-card.expanded")
		}
	}

	public async isTreeViewOpen() {
		await page.waitForSelector("#tree-view")
		const treeViewClassNames = await page.$eval("#tree-view", el => el.className)

		await page.waitForSelector("#search-panel-card")
		const searchPanelClassNames = await page.$eval("#search-panel-card", el => el.className)

		return treeViewClassNames.includes("current") && searchPanelClassNames.includes("expanded")
	}
}
