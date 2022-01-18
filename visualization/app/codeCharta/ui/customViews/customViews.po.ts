import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class CustomViewsPageObject {
	async enableExperimentalFeatures() {
		await clickButtonOnPageElement("global-settings-button-component .toolbar-button")
		await page.waitForSelector("md-dialog.global-settings", { visible: true })
		await clickButtonOnPageElement("md-dialog.global-settings div.md-dialog-content md-input-container:nth-child(4) md-checkbox")

		// Close Global Settings dialog
		await clickButtonOnPageElement("code-charta-component")
		await page.waitForSelector("md-dialog.global-settings", { hidden: true })
	}

	async openCustomViewPanel() {
		await page.waitForSelector(".custom-views-button", { hidden: false })
		await clickButtonOnPageElement("custom-views-component md-menu:nth-child(1) .custom-views-button")

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
		await clickButtonOnPageElement(".custom-views-button.plus")

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

	async hasCustomViewItemGroups() {
		await page.waitForSelector(".custom-views-drop-down span.collapse-trigger:nth-child(1)")
	}

	async hasCustomViewItemGroup(groupName: string, groupIndex: number) {
		await page.waitForFunction(
			(index, name) => document.querySelectorAll(".custom-views-drop-down span.collapse-trigger")[index].innerHTML.includes(name),
			{},
			groupIndex,
			groupName
		)
	}

	async collapseCustomViewItemGroup(groupIndex: number) {
		// +2 to skip two disabled/invisible menu-items
		await clickButtonOnPageElement(`.custom-views-drop-down .custom-views-item:nth-child(${groupIndex + 2}) .button-hovering`)
		await page.waitForSelector(`.custom-views-drop-down .custom-views-item:nth-child(${groupIndex + 2}) .collapsable`, {
			visible: true
		})
	}
}
