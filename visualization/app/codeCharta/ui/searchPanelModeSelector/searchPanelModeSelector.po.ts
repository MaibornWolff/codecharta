export class SearchPanelModeSelectorPageObject {
	private TRANSITION_TIME = 500

	public async toggleTreeView() {
		await expect(page).toClick("#tree-view")
		await page.waitFor(this.TRANSITION_TIME)
	}

	public async isTreeViewOpen() {
		const classNames = await page.$eval("#tree-view", el => el.className)

		return classNames.includes("current")
	}
}
