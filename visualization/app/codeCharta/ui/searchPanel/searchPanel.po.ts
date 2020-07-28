export class SearchPanelPageObject {
	private EXPANDED = "expanded"

	public async toggle() {
		const wasOpen = await this.isOpen()

		await expect(page).toClick("search-panel-component md-card .section .section-title")

		if (wasOpen) {
			await page.waitFor(() => !document.querySelector(`#search-panel-card.${this.EXPANDED}`))
		} else {
			await page.waitForSelector(`#search-panel-card.${this.EXPANDED}`)
		}
	}

	public async isOpen(): Promise<boolean> {
		const classNames = await page.$eval("#search-panel-card", el => el["className"])
		return classNames.includes(this.EXPANDED)
	}
}
