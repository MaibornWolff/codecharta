export class FilePanelPageObject {
	async getSelectedName() {
		await page.waitForSelector("file-panel-component md-select .md-text")
		return page.$eval("file-panel-component md-select .md-text", element => element["innerText"])
	}

	async getSelectedChangedName(oldName : string) {
		await page.waitForSelector("file-panel-component md-select .md-text")
		await this.waitUntilNameChange(oldName)
		return page.$eval("file-panel-component md-select .md-text", element => element["innerText"])
	}

	private async waitUntilNameChange(oldName : string) {
		await page.waitForFunction((names) => {
			return document.querySelector(`file-panel-component md-select .md-text md-truncate`).textContent!==names
		}, {}, oldName)
	}

	async clickChooser() {
		await expect(page).toClick("file-panel-component md-select")
	}

	async getAllNames() {
		await this.clickChooser()
		await page.waitForSelector(".md-select-menu-container.md-active > md-select-menu")

		const content = await page.$eval(".md-select-menu-container.md-active > md-select-menu", element => element["innerText"])
		
		return content.split("\n")
	}

	/*async getAllNamesWithWait(oldName : string) {
		await this.clickChooser()
		await page.waitForSelector(".md-select-menu-container.md-active > md-select-menu")
		await this.waitUntilNameChanges(oldName)

		const content = await page.$eval(".md-select-menu-container.md-active > md-select-menu", element => element["innerText"])

		return content.split("\n")
	}

	private async waitUntilNameChanges(oldName : string) {
		await page.waitForFunction((names) => {
			let changed = true
			const elements = document.querySelector(`.md-select-menu-container.md-active > md-select-menu`)
			const fileNames = elements.childNodes[0]["innerText"].split("\n")
			fileNames.forEach((item : string) => {
				if (item===names)
					changed = false
			})
			return changed
		}, {}, oldName)
	}*/
}
