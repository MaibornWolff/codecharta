import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class BlacklistPanelPageObject {
	async checkExludedListAfterExclusion() {
		const result = await page.evaluate(() => {
			const element = document.querySelector("#excludedList")
			const list = element.querySelectorAll("bdi")

			if (list[0].innerHTML === "Add pattern via search or node context-menu" && list.length === 1) {
				return false
			}
			const listContent: string[] = []
			list.forEach(el => listContent.push(el.innerHTML))

			return listContent.includes("*ts*") && listContent.includes("*html*")
		})
		return result
	}

	async checkExludedListAfterItemRemovalFromExclusionList() {
		const excludeOption = await page.evaluate(() => {
			const element = document.querySelector("#object-0")
			return element
		})

		if (excludeOption) {
			await clickButtonOnPageElement("#blacklist")
		}

		const result = await page.evaluate(() => {
			const elet = document.querySelector("#excludedList")
			const list = elet.querySelectorAll("bdi")

			if (list[0].innerHTML === "Add pattern via search or node context-menu" && list.length === 1) {
				return false
			}
			const listContent: string[] = []
			list.forEach(el => listContent.push(el.innerHTML))
			
			return listContent.includes("*ts*") && !listContent.includes("*html*")
		})
		return result
	}
}