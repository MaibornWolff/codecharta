export class FilePanelPageObject {
	constructor(private page) {}

	public async getSelectedName() {
		return await this.page.evaluate(() => document.querySelector("file-panel-component md-select .md-text")["innerText"])
	}

	public async clickChooser() {
		return this.page.click("file-panel-component md-select")
	}

	public async getAllNames() {
		let content = await this.page.evaluate(
			() => document.querySelector(".md-select-menu-container.md-active > md-select-menu")["innerText"]
		)
		return content.split("\n")
	}
}
