import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class SearchBarPageObject {
	async enterAndExcludeSearchPattern(search: string) {
		const input = await page.waitForSelector("#searchInput", { visible: true })
		await input.focus()
		await input.type(search)

		await page.waitForTimeout(500)

		await clickButtonOnPageElement("#blacklistMenu")

		await page.waitForTimeout(500)

		await clickButtonOnPageElement("#toExcludeButton")
	}

	async searchInputIsDisabled() {
		const input = await page.waitForSelector("#searchInput[disabled]", { visible: true })
		return input ? true : false
	}
}
