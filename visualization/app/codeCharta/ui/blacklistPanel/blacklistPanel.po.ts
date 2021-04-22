import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class BlacklistPanelPageObject {
	async checkExludedListAfterExclusion(paths: string[]) {
		await page.waitForSelector("#excludedList", { visible: true, hidden: false })

		const selector = "#excludedList > md-list-item > div.pattern-text.layout-column > p > bdi"

		const list = await page.$$eval(selector, ls => {
			return ls.map(x => {
				return x.innerHTML
			})
		})
		const filtered = list.filter(x => {
			for (const path of paths) {
				if (x === path) {
					return true
				}
			}
		})
		return filtered.length === paths.length
	}

	async checkExludedListAfterItemRemovalFromExclusionList() {
		await page.waitForSelector("#excludedList", { visible: true, hidden: false })

		await clickButtonOnPageElement("#object-1")

		const selector = "#excludedList > md-list-item > div.pattern-text.layout-column > p > bdi"

		const list = await page.$$eval(selector, ls => {
			return ls.map(x => {
				return x.innerHTML
			})
		})
		return list.includes("*html*") && !list.includes("*ts*")
	}
}
