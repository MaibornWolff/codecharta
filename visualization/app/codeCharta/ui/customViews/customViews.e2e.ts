import { goto } from "../../../puppeteer.helper"
import { CustomViewsPageObject } from "./customViews.po"

describe("CustomViews", () => {

    let customViews : CustomViewsPageObject

    beforeEach(async () => {
    	customViews = new CustomViewsPageObject()

    	await goto()
    })

    it("should do something", async () => {
        expect(await customViews.doSomething()).toContain("SOME_RESULT")
    });

});