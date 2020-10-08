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
        expect(await customViews.isCustomViewAddDialogOpen()).toBeTruthy()

        // Add
        await customViews.fillInCustomViewName()
        await customViews.submitAddDialog()
        expect(await customViews.isCustomViewAddDialogClosed()).toBeTruthy()

        // Open Again
        await customViews.openCustomViewAddDialog()
        expect(await customViews.isCustomViewAddDialogOpen()).toBeTruthy()

        // Enter existing name
        await customViews.fillInCustomViewName()
        expect(await customViews.isOverrideWarningVisible()).toBeTruthy()
    })

});