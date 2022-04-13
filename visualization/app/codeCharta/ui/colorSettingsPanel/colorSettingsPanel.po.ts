export const ColorSettingsPageObject = {
	async toggleInverColorBoundingBox() {
		const marginToggleBoxHandle = await page.$("color-settings-panel-component md-checkbox .md-container")
		return marginToggleBoxHandle.boundingBox()
	},

	async resetButtonBoundingBox() {
		const resetBoxHandle = await page.$("color-settings-panel-component cc-reset-settings-button")
		return resetBoxHandle.boundingBox()
	}
}
