export class SearchPanelModeSelectorPageObject {
	public async toggleTreeView() {
		const wasOpen = await this.isTreeViewOpen()

		await expect(page).toClick("#tree-view")

		if (wasOpen) {
			await page.waitFor(() => !document.querySelector("#search-panel-card.expanded"))
		} else {
			await page.waitForSelector("#search-panel-card.expanded")
		}
	}

	public async isTreeViewOpen() {
		const treeViewClassNames = await page.$eval("#tree-view", el => el.className)
		const searchPanelClassNames = await page.$eval("#search-panel-card", el => el.className)

		return treeViewClassNames.includes("current") && searchPanelClassNames.includes("expanded")
	}
}
