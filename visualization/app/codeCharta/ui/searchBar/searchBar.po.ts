import { AddAndSubmitInput, clickButtonOnPageElement } from "../../../puppeteer.helper"

export class SearchBarPageObject {
	async enterAndExcludeSearchPattern() {
		await page.click("#searchInput")
		await page.type("#searchInput", "html,ts")
		await clickButtonOnPageElement("#blacklistMenu",{ timeout: 6000 })
		await AddAndSubmitInput("#searchInput", "#blacklistMenu", "html,ts")

		const excludeOption = await page.evaluate(() => {
			const element = document.querySelector("#toExcludeButton")
			return element
		})

		if (excludeOption) {
			await clickButtonOnPageElement("#toExcludeButton", { timeout: 6000 })
			return true
		}
		return false
	}
}
