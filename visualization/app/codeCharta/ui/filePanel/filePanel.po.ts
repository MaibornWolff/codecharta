export class FilePanelPageObject {
	async getSelectedName() {
		await page.waitForSelector("file-panel-component md-select .md-text")
		return page.$eval("file-panel-component md-select .md-text", element => element["innerText"])
	}

	async clickChooser() {
		// expect toClick timeout does not work it might be the reason of flaky tests
		// [toClick issue](https://github.com/smooth-code/jest-puppeteer/issues/202)
		await page.waitForSelector("file-panel-component md-select", {timeout : 6000})
		await page.click("file-panel-component md-select")
	}

	async getAllNames() {
		await this.clickChooser()

		await page.waitForSelector(".md-select-menu-container.md-active > md-select-menu")
		const content = await page.$eval(".md-select-menu-container.md-active > md-select-menu", element => element["innerText"])
		return content.split("\n")
	}
}
