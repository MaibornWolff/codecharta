import { clickButtonOnPageElement } from "../../../puppeteer.helper"

/** When the ribbon bar is migrated we should replace this helper and the related e2e test through @testing-library/angular tests */
export class RibbonBarPageObject {
	private EXPANDED = "expanded"
	private EXPANDED_REMOVE = "expanded-remove"

	async isPanelOpenAngularJS(selector: string) {
		await page.waitForSelector(`#${selector}-card`)
		const classNames = await page.$eval(`#${selector}-card`, element => element["className"])
		return classNames.includes(this.EXPANDED) && !classNames.includes(this.EXPANDED_REMOVE)
	}

	async isPanelOpen(elementName: string) {
		await page.waitForFunction(elementName => document.querySelector(elementName), {}, elementName)
		return page.$eval(elementName, element => !element.classList.contains("hidden"))
	}

	async togglePanelAngularJS(selector: string) {
		const wasOpen = await this.isPanelOpenAngularJS(selector)
		await clickButtonOnPageElement(`#${selector}-card .section .section-title`)
		return !wasOpen
	}

	async togglePanel(selector: string, elementName: string) {
		const wasOpen = await this.isPanelOpen(elementName)
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
