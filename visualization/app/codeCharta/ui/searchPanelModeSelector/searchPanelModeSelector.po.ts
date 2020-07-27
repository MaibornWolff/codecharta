import { click } from "../../../puppeteer.helper"

export class SearchPanelModeSelectorPageObject {
	private TRANSITION_TIME = 500

	public async toggleTreeView() {
		await click("#tree-view")
		await page.waitFor(this.TRANSITION_TIME)
	}

	public async isTreeViewOpen() {
		const classNames = await page.$eval("#tree-view", el => el.className)

		return classNames.includes("current")
	}
}
