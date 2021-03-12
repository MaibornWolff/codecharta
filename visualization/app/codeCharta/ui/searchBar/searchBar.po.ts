import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class SearchBarPageObject {
	async enterAndExcludeSearchPattern() {
		await page.waitForSelector("#searchInput", { visible: true }).then(element => {
			element.focus()
			element.type("html,ts")
		})

		await page.waitForTimeout(500)

		await clickButtonOnPageElement("#blacklistMenu")
		await page.waitForSelector("#blacklistMenu", { visible: true }).then(async element => element.click())

		await page.waitForTimeout(500)

		await page.waitForSelector("#toExcludeButton", { visible: true }).then(async element => element.click())
	}
}
