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
})
