import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export const AreaSettingsPanelPageObject = {
	async toggleDefaultMargin() {
		await clickButtonOnPageElement("cc-area-settings-panel md-checkbox")
		return this.isDefaultMarginEnabled()
	},

	async isDefaultMarginEnabled() {
		return page.$eval("cc-area-settings-panel md-checkbox", element => element.className.includes("md-checked"))
	},

	async toggleMarginBoundingBox() {
		const marginToggleBoxHandle = await page.$("cc-area-settings-panel md-checkbox .md-container")
		return marginToggleBoxHandle.boundingBox()
	},

	async resetButtonBoundingBox() {
		const resetBoxHandle = await page.$("cc-area-settings-panel cc-reset-settings-button")
		return resetBoxHandle.boundingBox()
	}
}
