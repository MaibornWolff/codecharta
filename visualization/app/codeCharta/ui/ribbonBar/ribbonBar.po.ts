export class RibbonBarPageObject {
	private EXPANDED = "expanded"
	private TRANSITION_TIME = 500

	public async isPanelOpen(selector: string): Promise<boolean> {
		const classNames = await page.$eval(`ribbon-bar-component #${selector}-card`, el => el["className"])
		return classNames.includes(this.EXPANDED)
	}

	public async togglePanel(selector: string) {
		await expect(page).toClick(`ribbon-bar-component #${selector}-card .section .section-title`)
		await page.waitFor(this.TRANSITION_TIME)
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
