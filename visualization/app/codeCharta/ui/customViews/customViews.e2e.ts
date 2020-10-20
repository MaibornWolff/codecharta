import { goto } from "../../../puppeteer.helper"
import { CustomViewsPageObject } from "./customViews.po"

describe("CustomViews", () => {

    let customViews : CustomViewsPageObject

    beforeEach(async () => {
    	customViews = new CustomViewsPageObject()

    	await goto()
    })

    it("FastAdding CustomView with already existing name will show a warning message", async () => {
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
    })

});