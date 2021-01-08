import { enableConsole, disableConsole } from "../../../puppeteer.helper"

export class FilePanelPageObject {
	async getSelectedName() {
		await page.waitForSelector("file-panel-component md-select .md-text")
		return page.$eval("file-panel-component md-select .md-text", element => element["innerText"])
	}

	async clickChooser() {
		await expect(page).toClick("file-panel-component md-select") // timeout added globally in puppeteer.helper.ts
	}

	async getAllNames() {
		enableConsole()
		await this.clickChooser()
		try {
			await page.waitForSelector(".md-select-menu-container.md-active > md-select-menu");
		} 
		catch {
			const snapshot = page.accessibility.snapshot({
				interestingOnly : false
			})
			// @ts-ignore
			// eslint-disable-next-line no-console
			console.log(snapshot)
		}

		const content = await page.$eval(".md-select-menu-container.md-active > md-select-menu", element => element["innerText"])
		disableConsole()
		return content.split("\n")
	}
}
