export class AreaSettingsPanelPageObject {
	static async toggleDefaultMargin() {
		await expect(page).toClick("area-settings-panel-component md-checkbox", { timeout: 3000 })
		return this.isDefaultMarginEnabled()
	}

	static async isDefaultMarginEnabled() {
		return page.$eval("area-settings-panel-component md-checkbox", element => element.className.includes("md-checked"))
	}

	static async toggleMarginBoundingBox() {
		const marginToggleBoxHandle = await page.$("area-settings-panel-component md-checkbox .md-container")
		return marginToggleBoxHandle.boundingBox()
	}

	static async resetButtonBoundingBox() {
		const resetBoxHandle = await page.$("area-settings-panel-component reset-settings-button-component")
		return resetBoxHandle.boundingBox()
	}
}
