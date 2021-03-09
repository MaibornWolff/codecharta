import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class SearchBarPageObject {
	async enterAndExcludeSearchPattern() {
		await page.click("#searchInput")
		await page.type("#searchInput", "html,ts")
		await expect(page).toClick("#blacklistMenu", { timeout: 3000 })

		const excludeOption = await page.evaluate(() => {
			const element = document.querySelector("#toExcludeButton")
			return element
		})

		if (excludeOption) {
			//await expect(page).toClick("#toExcludeButton", { timeout: 3000 })
			await clickButtonOnPageElement("#toExcludeButton")
			return true
		}
		return false
	}
}
