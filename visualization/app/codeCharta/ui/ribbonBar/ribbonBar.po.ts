export class RibbonBarPageObject {
	private EXPANDED = "expanded"

	async isPanelOpen(selector: string) {
		await page.waitForSelector(`#${selector}-card`)
		const classNames = await page.$eval(`#${selector}-card`, element => element["className"])
		return classNames.includes(this.EXPANDED)
	}

	async togglePanel(selector: string) {
		const wasOpen = await this.isPanelOpen(selector)

		await expect(page).toClick(`#${selector}-card .section .section-title`, { timeout: 3000 })

		await (wasOpen
			? page.waitForSelector(`#${selector}-card`, { visible: false })
			: page.waitForSelector(`#${selector}-card.${this.EXPANDED}`))

		return !wasOpen
	}

	async focusSomething() {
		await page.evaluate(() => {
			const element = <HTMLElement>document.getElementsByClassName("md-ink-ripple")[0]
			element.focus()
		})
	}

	async getActiveClassName() {
		return page.evaluate(() => document.activeElement.className)
	}
}
