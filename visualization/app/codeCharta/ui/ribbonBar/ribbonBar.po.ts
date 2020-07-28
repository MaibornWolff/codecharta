export class RibbonBarPageObject {
	private EXPANDED = "expanded"

	public async isPanelOpen(selector: string): Promise<boolean> {
		const classNames = await page.$eval(`#${selector}-card`, el => el["className"])
		return classNames.includes(this.EXPANDED)
	}

	public async togglePanel(selector: string) {
		const wasOpen = await this.isPanelOpen(selector)

		await expect(page).toClick(`#${selector}-card .section .section-title`)

		if (wasOpen) {
			await page.waitFor(() => !document.querySelector(`ribbon-bar-component #${selector}-card.${this.EXPANDED}`))
		} else {
			await page.waitForSelector(`#${selector}-card.${this.EXPANDED}`)
		}
	}

	public async focusSomething(): Promise<void> {
		await page.evaluate(() => {
			const element = <HTMLElement>document.getElementsByClassName("md-ink-ripple")[0]
			element.focus()
		})
	}

	public async getActiveClassName(): Promise<string> {
		return page.evaluate(() => document.activeElement.className)
	}
}
