import { test, expect } from "@playwright/test"
import { CC_URL, clearIndexedDB, goto } from "../../playwright.helper"
import { FilePanelPageObject } from "../ui/filePanel/filePanel.po"
import sample1 from "../assets/sample1.cc.json"
import sample3 from "../assets/sample3.cc.json"
import sample2 from "../assets/sample2.cc.json"
import { gzip } from "pako"
import { DialogErrorPageObject } from "../ui/dialogs/errorDialog/errorDialog.component.po"

test.describe("codecharta", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should load data when compressed file parameters in url are valid", async ({ page }) => {
        const filePanel = new FilePanelPageObject(page)

        await page.route("**/*", async route => {
            if (route.request().url().includes("/fileThree.json.gz")) {
                const compressFile = gzip(JSON.stringify(sample2))
                const buffer = Buffer.from(compressFile)
                await route.fulfill({
                    status: 200,
                    contentType: "blob",
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: buffer
                })
            } else {
                await route.continue()
            }
        })

        await goto(page, `${CC_URL}?file=fileThree.json.gz`)
        expect(await filePanel.getSelectedName()).toEqual("Sample Project")
    })

    test("should load data when file parameters in url are valid", async ({ page }) => {
        const filePanel = new FilePanelPageObject(page)

        await page.route("**/*", async route => {
            if (route.request().url().includes("/fileOne.json")) {
                await route.fulfill({
                    contentType: "application/json",
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify(sample1)
                })
            } else if (route.request().url().includes("/fileTwo.json")) {
                await route.fulfill({
                    contentType: "application/json",
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify(sample3)
                })
            } else {
                await route.continue()
            }
        })

        await goto(page, `${CC_URL}?file=fileOne.json&file=fileTwo.json`)
        expect(await filePanel.getAllNames()).toEqual(["Sample Project", "Sample Project with Edges"])
    })

    test("should throw errors when file parameters in url are invalid and load sample data instead", async ({ page }) => {
        const dialogError = new DialogErrorPageObject(page)
        const filePanel = new FilePanelPageObject(page)

        await goto(page, `${CC_URL}?file=invalid234`)

        const message = await dialogError.getMessage()
        expect(message).toEqual("Error (Http failure response for invalid234: 0 Unknown Error)")
        await page.locator(".mat-mdc-dialog-container").waitFor({ state: "visible" })
        await dialogError.clickOk()

        expect(await filePanel.getSelectedName()).toEqual("sample1, sample2")
        expect(await filePanel.getAllNames()).toEqual(["sample1", "sample2"])
    })
})
