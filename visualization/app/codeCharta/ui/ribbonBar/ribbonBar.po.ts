import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class RibbonBarPageObject {
	private EXPANDED = "expanded"
	private EXPANDED_REMOVE = "expanded-remove"

	async isPanelOpen(selector: string) {
		await page.waitForSelector(`#${selector}-card`)
		const classNames = await page.$eval(`#${selector}-card`, element => element["className"])
		return classNames.includes(this.EXPANDED) && !classNames.includes(this.EXPANDED_REMOVE)
	}

	async togglePanel(selector: string) {
		const wasOpen = await this.isPanelOpen(selector)
		await clickButtonOnPageElement(`#${selector}-card .section .section-title`)

		await (wasOpen ? page.waitForSelector(`#${selector}-card`) : page.waitForSelector(`#${selector}-card.${this.EXPANDED}`))

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

	async isElementPresent(selector: string) {
		let visible = true
		await page.waitForSelector(`#${selector}-card`, { visible: true, timeout: 2000 }).catch(() => {
			visible = false
		})
		return visible
	}
}
