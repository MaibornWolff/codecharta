export class BlacklistPanelPageObject {
	async checkExludedListAfterExclusion() {
		const result = await page.evaluate(() => {
			const element = document.querySelector("#excludedList")
			const list = element.querySelectorAll("bdi")

			if (list[0].innerHTML === "Add pattern via search or node context-menu" && list.length === 1) {
				return false
			}
			const listContent: string[] = []
			// eslint-disable-next-line no-use-before-define
			for (const element of list) {
				listContent.push(element.innerHTML.trim())
			}
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
			await expect(page).toClick("#object-0", { timeout: 3000 })
		}

		const result = await page.evaluate(() => {
			const elet = document.querySelector("#excludedList")
			const list = elet.querySelectorAll("bdi")

			if (list[0].innerHTML === "Add pattern via search or node context-menu" && list.length === 1) {
				return false
			}
			const listContent: string[] = []
			// eslint-disable-next-line no-use-before-define
			for (const element of list) {
				listContent.push(element.innerHTML.trim())
			}
			return listContent.includes("*ts*") && !listContent.includes("*html*")
		})
		return result
	}
}
