import { Page } from "puppeteer"

export class MapTreeViewLevelPageObject {
	constructor(private page: Page) {}

	public async openContextMenu(path: string) {
		await this.page.click(`[id='${path}']`, { button: "right" })
	}

	public async openFolder(path: string) {
		await this.page.click(`[id='${path}']`)
	}

	public async hoverNode(path: string) {
		await this.page.hover(`[id='${path}']`)
	}

	public async nodeExists(path: string) {
		return !!(await this.page.$(`[id='${path}']`))
	}
}
