import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class CustomConfigsPageObject {
	async openCustomConfigPanel() {
		await page.waitForSelector(".custom-configs-button", { hidden: false })
		await clickButtonOnPageElement("custom-configs-component md-menu:nth-child(1) .custom-configs-button")

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
		await clickButtonOnPageElement(".custom-configs-button.plus")

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
		await clickButtonOnPageElement("md-dialog-actions .md-primary")
	}

	async isOverrideWarningVisible() {
		return page.waitForSelector(".md-dialog-content .fa-warning", { visible: true })
	}

	async switchToMultipleMode() {
		await page.waitForSelector("file-panel-component", { visible: true })
		await clickButtonOnPageElement("file-panel-component button.middle")

		await page.waitForSelector("file-panel-component button.middle.current", { visible: true })
	}

	async switchToDeltaMode() {
		await page.waitForSelector("file-panel-component", { visible: true })
		await clickButtonOnPageElement("file-panel-component button.right")

		await page.waitForSelector("file-panel-component button.right.current", { visible: true })
	}

	async hasCustomConfigItemGroups() {
		await page.waitForSelector(".custom-configs-drop-down span.collapse-trigger:nth-child(1)")
	}

	async hasCustomConfigItemGroup(groupName: string, groupIndex: number) {
		await page.waitForFunction(
			(index, name) => document.querySelectorAll(".custom-configs-drop-down span.collapse-trigger")[index].innerHTML.includes(name),
			{},
			groupIndex,
			groupName
		)
	}

	async collapseCustomConfigItemGroup(groupIndex: number) {
		// +2 to skip two disabled/invisible menu-items
		await clickButtonOnPageElement(`.custom-configs-drop-down .custom-configs-item:nth-child(${groupIndex + 2}) .button-hovering`)
		await page.waitForSelector(`.custom-configs-drop-down .custom-configs-item:nth-child(${groupIndex + 2}) .collapsable`, {
			visible: true
		})
	}
}
