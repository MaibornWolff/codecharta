export class SearchPanelPageObject {
	private EXPANDED = "expanded"
	private TRANSITION_TIME = 500

	public async toggle() {
		await expect(page).toClick("search-panel-component md-card .section .section-title")
		await page.waitFor(this.TRANSITION_TIME)
	}

	public async isOpen(): Promise<boolean> {
		const classNames = await page.$eval("search-panel-component md-card", el => el["className"])
		return classNames.includes(this.EXPANDED)
	}
}
