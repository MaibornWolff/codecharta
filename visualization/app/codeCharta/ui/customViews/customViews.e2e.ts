import { goto } from "../../../puppeteer.helper"
import { CustomViewsPageObject } from "./customViews.po"

describe("CustomViews", () => {

    let customViews : CustomViewsPageObject

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

        // Open
        await customViews.openCustomViewAddDialog()
        await customViews.isCustomViewAddDialogOpen()

        // Add
        await customViews.fillInCustomViewName()
        await customViews.submitAddDialog()
        await customViews.isCustomViewAddDialogClosed()

        // Open Again
        await customViews.openCustomViewAddDialog()
        await customViews.isCustomViewAddDialogOpen()

        // Enter existing name
        await customViews.fillInCustomViewName()
        await customViews.isOverrideWarningVisible()
    }, 60000)

});
