import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export const AreaSettingsPanelPageObject = {
	async toggleDefaultMargin() {
		await clickButtonOnPageElement("cc-area-settings-panel mat-checkbox")
		return this.isDefaultMarginEnabled()
	},
	async isDefaultMarginEnabled() {
		return page.$eval("cc-area-settings-panel mat-checkbox", element => element.className.includes("mat-checkbox-checked"))
	},
	async toggleMarginBoundingBox() {
		const marginToggleBoxHandle = await page.$("cc-area-settings-panel mat-checkbox")
		return marginToggleBoxHandle.boundingBox()
	},
	async resetButtonBoundingBox() {
		const resetBoxHandle = await page.$("cc-area-settings-panel cc-reset-settings-button")
		return resetBoxHandle.boundingBox()
	}
}
