import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class NodeContextMenuPageObject {
	async hasColorButtons() {
		return page.waitForSelector(".colorButton", {
			visible: true
		})
	}

	async exclude() {
		await clickButtonOnPageElement("#exclude-button")
		await page.waitForSelector("#loading-gif-map", { visible: false })
	}

	async isOpened() {
		await page.waitForSelector("#codemap-context-menu", { visible: true })
	}

	async isClosed() {
		await page.waitForSelector("#codemap-context-menu", { hidden: true })
	}

	async areButtonsDisabled() {
		await page.waitForSelector("#codemap-context-menu", { visible: true })
		const selector = "#codemap-context-menu > div.button-group"
		const condition = await page.$eval(selector, element => {
			return element.classList.contains("div-disabled")
		})
		return condition
	}
}
