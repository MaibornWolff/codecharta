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
		return !wasOpen
	}

	public async isOpen() {
		await page.waitForSelector("#search-panel-card")
		const classNames = await page.$eval("#search-panel-card", element => element["className"])
		return classNames.includes(this.EXPANDED)
	}
}
