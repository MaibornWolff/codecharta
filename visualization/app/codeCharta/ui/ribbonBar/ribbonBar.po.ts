import { Page } from "puppeteer"
import { click } from "../../../puppeteer.helper"

export class RibbonBarPageObject {
	private EXPANDED = "expanded"
	private TRANSITION_TIME = 500

	constructor(private page: Page) {}

	public async isPanelOpen(selector: string): Promise<boolean> {
		const classNames = await this.page.$eval(`ribbon-bar-component #${selector}-card`, el => el["className"])
		return classNames.includes(this.EXPANDED)
	}

	public async togglePanel(selector: string) {
		await click(`ribbon-bar-component #${selector}-card .section .section-title`)
		await this.page.waitFor(this.TRANSITION_TIME)
	}

	public async focusSomething(): Promise<void> {
		await this.page.evaluate(() => {
			const element = <HTMLElement>document.getElementsByClassName("md-ink-ripple")[0]
			element.focus()
		})
	}

	public async getActiveClassName(): Promise<string> {
		return this.page.evaluate(() => document.activeElement.className)
	}
}
