export class ColorSettingsPageObject {
	static async toggleInverColorBoundingBox() {
		const marginToggleBoxHandle = await page.$("color-settings-panel-component md-checkbox .md-container")
		return marginToggleBoxHandle.boundingBox()
	}

	static async resetButtonBoundingBox() {
		const resetBoxHandle = await page.$("color-settings-panel-component reset-settings-button-component")
		return resetBoxHandle.boundingBox()
	}
}
