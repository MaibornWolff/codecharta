export class AreaSettingsPanelPageObject {
	static async toggleDynamicMargin() {
		await expect(page).toClick("area-settings-panel-component md-checkbox", { timeout: 3000 })
		return this.isDynamicMarginEnabled()
	}

	static async isDynamicMarginEnabled() {
		return page.$eval("area-settings-panel-component md-checkbox", element => element.className.includes("md-checked"))
	}
}
