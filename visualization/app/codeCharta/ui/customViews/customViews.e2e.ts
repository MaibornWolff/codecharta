import { goto } from "../../../puppeteer.helper"
import { CustomViewsPageObject } from "./customViews.po"

describe("CustomViews", () => {
	let customViews: CustomViewsPageObject

	beforeEach(async () => {
		customViews = new CustomViewsPageObject()

		await goto()
	})

	it("CustomView Feature will not be shown by default due to it's experimental status", async () => {
		await customViews.isCustomViewFeatureDisabled()
	})

	it("QuickAdding CustomView with already existing name will show a warning message", async () => {
		// Enable experimental CustomViews Feature first
		await customViews.enableExperimentalFeatures()

		await customViews.addCustomView("TestViewName")

		// Open Again
		await customViews.openCustomViewAddDialog()
		await customViews.isCustomViewAddDialogOpen()

		// Enter existing name
		await customViews.fillInCustomViewName()
		await customViews.isOverrideWarningVisible()
	}, 90000)

	it("Custom Configs for SINGLE, MULTIPLE, DELTA mode will be shown in separate groups (grouped by selection mode) and can be collapsed properly", async () => {
		// Enable experimental CustomViews Feature first
		await customViews.enableExperimentalFeatures()
		await customViews.addCustomView("TestSingleView")

		await customViews.switchToMultipleMode()
		await customViews.addCustomView("TestMultipleView")

		await customViews.switchToDeltaMode()
		await customViews.addCustomView("TestDeltaView")

		// Open
		await customViews.openCustomViewPanel()
		await customViews.hasCustomViewItemGroups()

		// We are in delta mode, so delta mode is shown as the first group.
		await customViews.hasCustomViewItemGroup("delta", 0)
		await customViews.hasCustomViewItemGroup("multiple", 1)
		await customViews.hasCustomViewItemGroup("single", 2)

		await customViews.collapseCustomViewItemGroup(1)
		await customViews.collapseCustomViewItemGroup(2)
		await customViews.collapseCustomViewItemGroup(3)

	}, 90000)
})
