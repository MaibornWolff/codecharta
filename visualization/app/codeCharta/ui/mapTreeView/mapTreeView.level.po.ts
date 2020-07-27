import { Page } from "puppeteer"
import { click } from "../../../puppeteer.helper"

export class MapTreeViewLevelPageObject {
	constructor(private page: Page) {}

	public async openContextMenu(path: string) {
		await this.page.click(`[id='${path}']`, { button: "right" })
	}

	public async openFolder(path: string) {
		await click(`[id='${path}']`)
	}

	public async hoverNode(path: string) {
		await this.page.hover(`[id='${path}']`)
	}

	public async nodeExists(path: string) {
		return !!(await this.page.$(`[id='${path}']`))
	}
}
