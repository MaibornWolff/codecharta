import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class DialogGlobalSettingsPageObject {
	async openGlobalSettings() {
		await clickButtonOnPageElement("global-settings-button-component .toolbar-button")
		await page.waitForSelector("md-dialog.global-settings")
	}

	async getMapLayoutLabel() {
		return page.$eval("layout-selection-component > div > md-input-container > label", element => element["innerText"])
	}

	async getDisplayQualityLabel() {
		return page.$eval("sharpness-mode-selector-component > div > md-input-container > label", element => element["innerText"])
	}
}
