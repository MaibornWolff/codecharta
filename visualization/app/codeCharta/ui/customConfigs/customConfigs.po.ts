export class CustomConfigsPageObject {
	async toggleExperimentalFeatures() {
		await expect(page).toClick("global-settings-button-component .toolbar-button", { timeout: 3000 })
		await page.waitForSelector("md-dialog.global-settings", { visible: true })
		await expect(page).toClick("md-dialog.global-settings div.md-dialog-content md-input-container:nth-child(6) md-checkbox", {
			timeout: 3000
		})

		// Close Global Settings dialog
		await expect(page).toClick("md-dialog-actions > button", { timeout: 3000 })
		await page.waitForSelector("md-dialog.global-settings", { hidden: true })
	}

	async openCustomConfigPanel() {
		await page.waitForSelector(".custom-configs-button", { hidden: false })
		await expect(page).toClick("custom-configs-component md-menu:nth-child(1) .custom-configs-button", { timeout: 3000 })

		await page.waitForSelector(".custom-configs-drop-down", { visible: true })
	}

	async addCustomConfig(name: string) {
		// Open add dialog
		await this.openCustomConfigAddDialog()
		await this.isCustomConfigAddDialogOpen()

		// Fill in CustomConfig name and add it
		await this.fillInCustomConfigName(name)
		await this.submitAddDialog()
		await this.isCustomConfigAddDialogClosed()
	}

	async openCustomConfigAddDialog() {
		await page.waitForSelector(".custom-configs-button.plus", { visible: true })
		await expect(page).toClick(".custom-configs-button.plus", { timeout: 3000 })

		await page.waitForSelector(".custom-config-dialog")
	}

	async closeCustomConfigAddDialog() {
		await page.waitForSelector(".custom-configs-button.plus", { visible: true })
		await expect(page).toClick(".custom-configs-button.plus", { timeout: 3000 })

		await page.waitForSelector(".custom-config-dialog")
	}

	async isCustomConfigFeatureDisabled() {
		await page.waitForSelector(".custom-configs-button", { hidden: true })
	}

	async isCustomConfigAddDialogOpen() {
		await page.waitForSelector(".custom-config-dialog", { visible: true })
	}

	async isCustomConfigAddDialogClosed() {
		await page.waitForSelector(".custom-config-dialog", { hidden: true })
	}

	async fillInCustomConfigName(name = "TestConfigName") {
		return expect(page).toFill(".custom-config-input", name, { timeout: 3000 })
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

	async hasCustomConfigItemGroups() {
		await page.waitForSelector(".custom-configs-drop-down span.collapse-trigger:nth-child(1)")
	}

	async hasCustomConfigItemGroup(groupName: string, groupIndex: number) {
		await page.waitForFunction(
			(_groupIndex, _groupName) =>
				document.querySelectorAll(".custom-configs-drop-down span.collapse-trigger")[_groupIndex].innerHTML.includes(_groupName),
			{},
			groupIndex,
			groupName
		)
	}

	async collapseCustomConfigItemGroup(groupIndex: number) {
		// +2 to skip two disabled/invisible menu-items
		await expect(page).toClick(`.custom-configs-drop-down .custom-configs-item:nth-child(${groupIndex + 2}) .button-hovering`, {
			timeout: 3000
		})
		await page.waitForSelector(`.custom-configs-drop-down .custom-configs-item:nth-child(${groupIndex + 2}) .collapsable`, {
			visible: true
		})
	}
}
