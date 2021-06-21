import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class FilePanelPageObject {
	async getSelectedName() {
		await page.waitForSelector("file-panel-component md-select .md-text")
		return page.$eval("file-panel-component md-select .md-text", element => element["innerText"].trim())
	}

	async getSelectedChangedName(oldName: string) {
		await page.waitForSelector("file-panel-component md-select .md-text")
		await this.waitUntilNameChange(oldName)
		return page.$eval("file-panel-component md-select .md-text", element => element["innerText"].trim())
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
		await page.waitForSelector(".md-select-menu-container.md-active > md-select-menu")

		const content = await page.$eval(".md-select-menu-container.md-active > md-select-menu", element => element["innerText"].trim())

		return content.split("\n")
	}
}
