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

	async openCustomViewPanel() {
		await page.waitForSelector(".custom-views-button", { hidden: false })
		await expect(page).toClick("custom-views-component md-menu:nth-child(1) .custom-views-button", { timeout: 3000 })

		await page.waitForSelector(".custom-views-drop-down", { visible: true })
	}

	async addCustomView(name: string) {
		// Open add dialog
		await this.openCustomViewAddDialog()
		await this.isCustomViewAddDialogOpen()

		// Fill in CustomView name and add it
		await this.fillInCustomViewName(name)
		await this.submitAddDialog()
		await this.isCustomViewAddDialogClosed()
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
		await page.waitForSelector(".custom-view-dialog", { hidden: true })
	}

	async fillInCustomViewName(name = "TestViewName") {
		return expect(page).toFill(".custom-view-input", name, { timeout: 3000 })
	}

	async submitAddDialog() {
		return expect(page).toClick("md-dialog-actions .md-primary", { timeout: 3000 })
	}

	async isOverrideWarningVisible() {
		return page.waitForSelector(".md-dialog-content .fa-warning", { visible: true })
	}

	async switchToMultipleMode() {
		await page.waitForSelector("file-panel-component", { visible: true })
		await expect(page).toClick("file-panel-component button.middle", { timeout: 3000 })

		await page.waitForSelector("file-panel-component button.middle.current", { visible: true })
	}

	async switchToDeltaMode() {
		await page.waitForSelector("file-panel-component", { visible: true })
		await expect(page).toClick("file-panel-component button.right", { timeout: 3000 })

		await page.waitForSelector("file-panel-component button.right.current", { visible: true })
	}

	async hasCustomViewItemGroups() {
		await page.waitForSelector(".custom-views-drop-down span.collapse-trigger:nth-child(1)")
	}

	async hasCustomViewItemGroup(groupName: string, groupIndex: number) {
		await page.waitForFunction(
			(groupIndex, groupName) => document.querySelectorAll(".custom-views-drop-down span.collapse-trigger")[groupIndex].innerHTML.includes(groupName),
			{},
			groupIndex, groupName
		)
	}

	async collapseCustomViewItemGroup(groupIndex: number) {
		// +2 to skip two disabled/invisible menu-items
		await expect(page).toClick(`.custom-views-drop-down .custom-views-item:nth-child(${groupIndex + 2}) .button-hovering`, { timeout: 3000 })
		await page.waitForSelector(`.custom-views-drop-down .custom-views-item:nth-child(${groupIndex + 2}) .collapsable`, { visible: true })
	}
}
