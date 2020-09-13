export class FilePanelPageObject {
	public async getSelectedName() {
		await page.waitForSelector("file-panel-component md-select .md-text")
		return page.$eval("file-panel-component md-select .md-text", element => element["innerText"])
	}

	public async clickChooser() {
		await expect(page).toClick("file-panel-component md-select", { timeout: 3000 })
	}

	public async getAllNames() {
		await this.clickChooser()

		await page.waitForSelector(".md-select-menu-container.md-active > md-select-menu")
		const content = await page.$eval(".md-select-menu-container.md-active > md-select-menu", element => element["innerText"])
		return content.split("\n")
	}
}
