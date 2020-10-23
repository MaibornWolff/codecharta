export class CustomViewsPageObject {
	async enableExperimentalFeatures() {
		await expect(page).toClick("global-settings-button-component .toolbar-button", { timeout: 3000 })
		await page.waitForSelector("md-dialog.global-settings", { visible: true })
		await expect(page).toClick("md-dialog.global-settings div.md-dialog-content md-input-container:nth-child(4) md-checkbox", {
			timeout: 3000
		})

		// Close Global Settings dialog
		await expect(page).toClick("code-charta-component", { timeout: 3000 })
		await page.waitForSelector("md-dialog.global-settings", { hidden: true })
	}

	async openCustomViewAddDialog() {
		await page.waitForSelector(".custom-views-button.plus", { visible: true })
		await expect(page).toClick(".custom-views-button.plus", { timeout: 3000 })

		await page.waitForSelector(".custom-view-dialog")
	}

	async isCustomViewFeatureDisabled() {
		await page.waitForSelector(".custom-views-button", { hidden: true })
	}

	async isCustomViewAddDialogOpen() {
		await page.waitForSelector(".custom-view-dialog", { visible: true })
	}

	async isCustomViewAddDialogClosed() {
		await page.waitForSelector(".custom-view-dialog", { visible: false })
	}

	async fillInCustomViewName() {
		return expect(page).toFill(".custom-view-input", "TestViewName", { timeout: 3000 })
	}

	async submitAddDialog() {
		return expect(page).toClick("md-dialog-actions .md-primary")
	}

	async isOverrideWarningVisible() {
		return page.waitForSelector(".md-dialog-content .fa-warning", { visible: true })
	}
}
