import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class SearchBarPageObject {
	async enterAndExcludeSearchPattern(search: string) {
		const input = await page.waitForSelector("#searchInput", { visible: true })
		await input.focus()
		await input.type(search)

		await page.waitForFunction(
			(text: string) => (document.querySelector("#searchInput") as HTMLInputElement).value.includes(text),
			{},
			search
		)

		await clickButtonOnPageElement("#blacklistMenu")

		await page.waitForSelector("#blacklistMenuContent")
		await page.waitForFunction(
			(selector: string) => document.querySelector(selector).parentElement.classList.contains("md-clickable"),
			{},
			"#blacklistMenuContent"
		)

		await clickButtonOnPageElement("#toExcludeButton")
	}
}
