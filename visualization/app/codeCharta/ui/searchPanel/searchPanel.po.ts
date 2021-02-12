export class SearchPanelPageObject {
	private EXPANDED = "expanded"
	private EXPANDED_REMOVE = "expanded-remove"

	async toggle() {
		const wasOpen = await this.isOpen()

		await expect(page).toClick("search-panel-component md-card .section .section-title", { timeout: 3000 })

		await (wasOpen
			? page.waitForSelector("#search-panel-card", { visible: false })
			: page.waitForSelector(`#search-panel-card.${this.EXPANDED}`))

		return !wasOpen
	}

	async isOpen() {
		await page.waitForSelector("#search-panel-card")
		const classNames = await page.$eval("#search-panel-card", element => element["className"])
		return classNames.includes(this.EXPANDED) && !classNames.includes(this.EXPANDED_REMOVE)
	}
}
