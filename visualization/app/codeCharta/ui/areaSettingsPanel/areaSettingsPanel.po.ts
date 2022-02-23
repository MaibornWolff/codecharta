import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export const AreaSettingsPanelPageObject = {
	async toggleDefaultMargin() {
		await clickButtonOnPageElement("area-settings-panel-component md-checkbox")
		return this.isDefaultMarginEnabled()
	},

	async isDefaultMarginEnabled() {
		return page.$eval("area-settings-panel-component md-checkbox", element => element.className.includes("md-checked"))
	},

	async toggleMarginBoundingBox() {
		const marginToggleBoxHandle = await page.$("area-settings-panel-component md-checkbox .md-container")
		return marginToggleBoxHandle.boundingBox()
	},

	async resetButtonBoundingBox() {
		const resetBoxHandle = await page.$("area-settings-panel-component reset-settings-button-component")
		return resetBoxHandle.boundingBox()
	}
}
