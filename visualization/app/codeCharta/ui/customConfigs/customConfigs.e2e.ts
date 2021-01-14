import { goto } from "../../../puppeteer.helper"
import { CustomConfigsPageObject } from "./customConfigs.po"

describe("CustomConfigs", () => {
	let customConfigs: CustomConfigsPageObject

	beforeEach(async () => {
		customConfigs = new CustomConfigsPageObject()

		await goto()
	})

	it("CustomConfig Feature will not be shown by default due to it's experimental status", async () => {
		await customConfigs.isCustomConfigFeatureDisabled()
	})

	// @TODO the following ones are working in general but sometimes the tests fails. Fix and reactivate them.

	it("QuickAdding CustomConfig with already existing name will show a warning message", async () => {
		// Enable experimental CustomConfigs Feature first
		await customConfigs.enableExperimentalFeatures()

		await customConfigs.addCustomConfig("TestConfigName")

		// Open Again
		await customConfigs.openCustomConfigAddDialog()
		await customConfigs.isCustomConfigAddDialogOpen()

		// Enter existing name
		await customConfigs.fillInCustomConfigName()
		await customConfigs.isOverrideWarningVisible()
	}, 90000)

	it("Custom Configs for SINGLE, MULTIPLE, DELTA mode will be shown in separate groups (grouped by selection mode) and can be collapsed properly", async () => {
		// Enable experimental CustomConfigs Feature first
		await customConfigs.enableExperimentalFeatures()
		await customConfigs.addCustomConfig("TestSingleConfig")

		await customConfigs.switchToMultipleMode()
		await customConfigs.addCustomConfig("TestMultipleConfig")

		await customConfigs.switchToDeltaMode()
		await customConfigs.addCustomConfig("TestDeltaConfig")

		// Open
		await customConfigs.openCustomConfigPanel()
		await customConfigs.hasCustomConfigItemGroups()

		// We are in delta mode, so delta mode is shown as the first group.
		await customConfigs.hasCustomConfigItemGroup("delta", 0)
		await customConfigs.hasCustomConfigItemGroup("multiple", 1)
		await customConfigs.hasCustomConfigItemGroup("single", 2)

		await customConfigs.collapseCustomConfigItemGroup(1)
		await customConfigs.collapseCustomConfigItemGroup(2)
		await customConfigs.collapseCustomConfigItemGroup(3)
	}, 90000)
})
