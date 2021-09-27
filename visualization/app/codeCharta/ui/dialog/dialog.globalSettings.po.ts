import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class DialogGlobalSettingsPageObject {
	async openGlobalSettings() {
		await clickButtonOnPageElement("global-settings-button-component .toolbar-button")
		await page.waitForSelector("md-dialog.global-settings", { visible: true })
	}

	async getMapLayoutLabel() {
		return page.$eval("layout-selection-component > div > md-input-container > label", element => element["innerText"])
	}

	async getDisplayQualityLabel() {
		return page.$eval("sharpness-mode-selector-component > div > md-input-container > label", element => element["innerText"])
	}

	async changeLayoutToTreeMapStreet() {
		await clickButtonOnPageElement("div.md-dialog-content layout-selection-component div md-input-container md-select", {
			visible: true
		})
		await clickButtonOnPageElement('md-select-menu md-content [value="TreeMapStreet"]', { visible: true })
		await page.waitForSelector(".md-select-menu-container.md-active", { visible: false })
	}

	async getLayout() {
		await page.waitForSelector("layout-selection-component .md-select-value")
		return page.$eval("layout-selection-component .md-select-value", element => element["innerText"])
	}

	async isTreeMapFilesComponentVisible() {
		return page.waitForSelector("max-tree-map-files-component", { visible: true })
	}

	async changedDisplayQuality() {
		await clickButtonOnPageElement("div.md-dialog-content sharpness-mode-selector-component div md-input-container md-select", {
			visible: true
		})
		await clickButtonOnPageElement('md-select-menu md-content [value="Pixel Ratio without Antialiasing"]', { visible: true })
		await page.waitForSelector(".md-select-menu-container.md-active", { visible: false })
	}

	async getDisplayQuality() {
		await page.waitForSelector("sharpness-mode-selector-component .md-select-value .md-text")
		return page.$eval("sharpness-mode-selector-component .md-select-value .md-text", element => element["innerText"])
	}
}
