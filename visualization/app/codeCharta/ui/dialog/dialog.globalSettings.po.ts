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

	async changeLayoutToTreeMapStreet() {
		await page.click("div.md-dialog-content layout-selection-component div md-input-container md-select")
		await page.waitForSelector(".md-select-menu-container.md-active", { visible: true })
		await page.click('md-select-menu md-content [value="TreeMapStreet"]')
		await page.waitForSelector("#maxTreeMapFiles-slider > div", { visible: true })
	}

	async changeLayoutToSquarifiedTreeMap() {
		await page.click("div.md-dialog-content layout-selection-component div md-input-container md-select")
		await page.waitForSelector(".md-select-menu-container.md-active", { visible: true })
		await page.click('md-select-menu md-content [value="Squarified TreeMap"]')
	}

	async getLayout() {
		await page.waitForSelector("layout-selection-component .md-select-value")
		return page.$eval("layout-selection-component .md-select-value", element => element["innerText"])
	}

	async isTreeMapFilesComponentVisible() {
		return page.waitForSelector("max-tree-map-files-component", { visible: true })
	}

	async changedDisplayQuality() {
		await page.click("div.md-dialog-content sharpness-mode-selector-component div md-input-container md-select")
		await page.waitForSelector(".md-select-menu-container.md-active", { visible: true })
		await page.click('md-select-menu md-content [value="Pixel Ratio without Antialiasing"]')
	}

	async getDisplayQuality() {
		await page.waitForSelector("sharpness-mode-selector-component .md-select-value")
		return page.$eval("sharpness-mode-selector-component .md-select-value", element => element["innerText"])
	}
}
