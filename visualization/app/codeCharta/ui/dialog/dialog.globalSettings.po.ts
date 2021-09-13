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
		await page.waitForSelector("div.md-dialog-content layout-selection-component div md-input-container md-select", { visible: true })
		// make tests more stable - we should definitely remove those sleeps when migrating this component
		await new Promise(resolve => setTimeout(resolve, 100))
		await page.click("div.md-dialog-content layout-selection-component div md-input-container md-select")
		await page.waitForSelector('md-select-menu md-content [value="TreeMapStreet"]', { visible: true })
		await page.click('md-select-menu md-content [value="TreeMapStreet"]')
		// Switching a layout has a debounce time of at least one millisecond.
		// Delay the execution by a few milliseconds.
		await new Promise(resolve => setTimeout(resolve, 5))
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
		try {
			await page.waitForSelector(".md-select-menu-container.md-active", { visible: true })
		} catch {
			await page.click("div.md-dialog-content sharpness-mode-selector-component div md-input-container md-select")
		}
		await page.click('md-select-menu md-content [value="Pixel Ratio without Antialiasing"]')
		// Switching settings that have influence on the rendered map has a
		// debounce time of at least one millisecond.
		await new Promise(resolve => setTimeout(resolve, 5))
	}

	async getDisplayQuality() {
		await page.waitForSelector("sharpness-mode-selector-component .md-select-value")
		return page.$eval("sharpness-mode-selector-component .md-select-value", element => element["innerText"])
	}
}
