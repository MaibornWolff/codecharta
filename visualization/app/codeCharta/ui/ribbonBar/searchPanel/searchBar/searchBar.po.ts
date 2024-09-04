import { clickButtonOnPageElement } from "../../../../puppeteer.helper"

export class SearchBarPageObject {
    async enterAndExcludeSearchPattern(search: string) {
        const input = await page.waitForSelector(".ccSearchInput input", { visible: true })
        await input.focus()
        await input.type(search)

        await page.waitForFunction(
            (text: string) => (document.querySelector(".ccSearchInput input") as HTMLInputElement).value.includes(text),
            {},
            search
        )

        await clickButtonOnPageElement("[title='Add to Blacklist']")

        await page.waitForSelector("[data-testid='search-bar-exclude-button']")

        await clickButtonOnPageElement("[data-testid='search-bar-exclude-button']")
    }
}
