import { click } from "../../../puppeteer.helper"

export class MapTreeViewLevelPageObject {
	public async openContextMenu(path: string) {
		await page.click(`[id='${path}']`, { button: "right" })
	}

	public async openFolder(path: string) {
		await click(`[id='${path}']`)
	}

	public async hoverNode(path: string) {
		await page.hover(`[id='${path}']`)
	}

	public async nodeExists(path: string) {
		return !!(await page.$(`[id='${path}']`))
	}
}
