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

		/* TODO remove timeout */
		await page.waitForTimeout(500)

		await clickButtonOnPageElement("#toExcludeButton")
	}

	async searchInputIsDisabled(): Promise<boolean> {
		return (await page.waitForSelector("#searchInput[disabled]", { visible: true })) ? true : false
	}
}
