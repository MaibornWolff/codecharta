export class SearchPanelPageObject {
	private EXPANDED = "expanded"

	public async toggle() {
		const wasOpen = await this.isOpen()

		await expect(page).toClick("search-panel-component md-card .section .section-title", { timeout: 3000 })

		if (wasOpen) {
			await page.waitForSelector("#search-panel-card", { visible: false })
		} else {
			await page.waitForSelector(`#search-panel-card.${this.EXPANDED}`)
		}
	}

	public async isOpen(): Promise<boolean> {
		await page.waitForSelector("#search-panel-card")
		const classNames = await page.$eval("#search-panel-card", el => el["className"])
		return classNames.includes(this.EXPANDED)
	}
}
