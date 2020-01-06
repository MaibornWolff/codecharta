import { Page } from "puppeteer"
import { delay } from "../../../puppeteer.helper"

export class RibbonBarPageObject {
	private EXPANDED = "expanded"

	constructor(private page: Page) {}

	public async isPanelOpen(selector: string): Promise<boolean> {
		const classNames = await this.page.$eval(`ribbon-bar-component #${selector}-card`, el => el["className"])
		return classNames.includes(this.EXPANDED)
	}

	public async togglePanel(selector: string) {
		await this.page.click(`ribbon-bar-component #${selector}-card .section .section-title`)
		await delay(400)
	}

	public async getAreaMetricValue(): Promise<number> {
		return await this.page.$eval("area-metric-chooser-component .metric-value", el => el["innerText"])
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
