import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class FilePanelPageObject {
	async getSelectedName() {
		await page.waitForSelector("file-panel-component md-select .md-text")
		return page.$eval("file-panel-component md-select .md-text", element => element["innerText"])
	}

	async getSelectedChangedName(oldName: string) {
		await page.waitForSelector("file-panel-component md-select .md-text")
		await this.waitUntilNameChange(oldName)
		return page.$eval("file-panel-component md-select .md-text", element => element["innerText"])
	}

	private async waitUntilNameChange(oldName: string) {
		await page.waitForFunction(
			names => {
				return document.querySelector(`file-panel-component md-select .md-text md-truncate`).textContent !== names
			},
			{},
			oldName
		)
	}

	async getAllNames() {
		await clickButtonOnPageElement("file-panel-component md-select")
		/* TODO Remove Timeout*/
		//await page.waitForTimeout(500)

		await page.waitForSelector("body > md-backdrop.md-select-backdrop.md-click-catcher.ng-scope")
		await page.waitForFunction(
			(selector: string) => getComputedStyle(document.querySelector(selector)).position === "fixed",
			{},
			"body > md-backdrop.md-select-backdrop.md-click-catcher.ng-scope"
		)

		await page.waitForSelector(".md-select-menu-container.md-active > md-select-menu")

		const content = await page.$eval(".md-select-menu-container.md-active > md-select-menu", element => element["innerText"])

		return content.split("\n")
	}
}
