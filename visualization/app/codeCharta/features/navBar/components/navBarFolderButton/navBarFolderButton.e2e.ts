import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../../playwright.helper"
import { NavBarFolderButtonPageObject } from "./navBarFolderButton.po"
import { MapSelectorPageObject } from "../mapSelector/mapSelector.po"
import { ERROR_MESSAGES } from "../../../../util/fileValidator"
import { DialogErrorPageObject } from "../../../../features/shared/components/errorDialog/errorDialog.component.po"

test.describe("NavBarFolderButton", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should load a valid gameObjects file", async ({ page }) => {
        const folderButton = new NavBarFolderButtonPageObject(page)
        const filePanel = new MapSelectorPageObject(page)

        await folderButton.openFiles(["./app/codeCharta/assets/gameObjectsFile.json"])

        expect(await filePanel.getSelectedName()).toEqual("gameObjectsFile")
    })

    test("should load another cc.json", async ({ page }) => {
        const folderButton = new NavBarFolderButtonPageObject(page)
        const filePanel = new MapSelectorPageObject(page)

        await folderButton.openFiles(["./app/codeCharta/assets/sample3.cc.json"])

        expect(await filePanel.getSelectedName()).toEqual("sample3")
    })

    test("should load another .gz", async ({ page }) => {
        const folderButton = new NavBarFolderButtonPageObject(page)
        const filePanel = new MapSelectorPageObject(page)

        await folderButton.openFiles(["./app/codeCharta/assets/output.cc.json.gz"])

        expect(await filePanel.getSelectedName()).toEqual("output")
    })

    test("should load sample cc.json files", async ({ page }) => {
        const filePanel = new MapSelectorPageObject(page)

        const loadedMapsName = await filePanel.getAllNames()

        expect(loadedMapsName.length).toEqual(2)
        expect(loadedMapsName[0]).toEqual("sample1")
        expect(loadedMapsName[1]).toEqual("sample2")
    })

    test("should load multiple cc.json files", async ({ page }) => {
        const folderButton = new NavBarFolderButtonPageObject(page)
        const filePanel = new MapSelectorPageObject(page)

        await folderButton.openFiles(["./app/codeCharta/assets/sample3.cc.json", "./app/codeCharta/assets/sample4.cc.json"])

        const loadedMapsName = await filePanel.getAllNames()

        expect(loadedMapsName.length).toEqual(2)
        expect(loadedMapsName[0]).toEqual("sample3")
        expect(loadedMapsName[1]).toEqual("sample4")
    })

    test("should load multiple cc.json files after each other", async ({ page }) => {
        const folderButton = new NavBarFolderButtonPageObject(page)
        const filePanel = new MapSelectorPageObject(page)

        await folderButton.openFiles(["./app/codeCharta/assets/sample3.cc.json"])
        await folderButton.openFiles(["./app/codeCharta/assets/sample4.cc.json"])

        const loadedMapsName = await filePanel.getAllNames()

        expect(loadedMapsName.length).toEqual(2)
        expect(loadedMapsName[0]).toEqual("sample3")
        expect(loadedMapsName[1]).toEqual("sample4")
    })

    test("should keep the old map if opening a file was cancelled", async ({ page }) => {
        const folderButton = new NavBarFolderButtonPageObject(page)
        const filePanel = new MapSelectorPageObject(page)

        await folderButton.openFiles(["./app/codeCharta/assets/sample3.cc.json"])
        await folderButton.cancelOpeningFile()

        expect(await filePanel.getSelectedName()).toEqual("sample3")
    })

    test("should open an invalid file, close the dialog and open a valid file", async ({ page }) => {
        const folderButton = new NavBarFolderButtonPageObject(page)
        const filePanel = new MapSelectorPageObject(page)
        const dialogError = new DialogErrorPageObject(page)

        await folderButton.openFiles(["./public/codeCharta/assets/empty.png"])
        expect(await dialogError.getMessage()).toContain(` ${ERROR_MESSAGES.fileIsInvalid}`)

        await dialogError.clickOk()

        await folderButton.openFiles(["./app/codeCharta/assets/sample3.cc.json"])

        expect(await filePanel.getSelectedName()).toEqual("sample3")
    })

    test("should open an valid and an invalid file, close the dialog and open a valid file", async ({ page }) => {
        const folderButton = new NavBarFolderButtonPageObject(page)
        const filePanel = new MapSelectorPageObject(page)
        const dialogError = new DialogErrorPageObject(page)

        await folderButton.openFiles(["./public/codeCharta/assets/empty.png", "./app/codeCharta/assets/sample3.cc.json"])
        expect(await dialogError.getMessage()).toContain(` ${ERROR_MESSAGES.fileIsInvalid}`)

        await dialogError.clickOk()

        await folderButton.openFiles(["./app/codeCharta/assets/sample3.cc.json"])

        expect(await filePanel.getSelectedName()).toEqual("sample3")
    })

    test("should not load a map and show error, when loading a map with warning and a map with error", async ({ page }) => {
        const folderButton = new NavBarFolderButtonPageObject(page)
        const filePanel = new MapSelectorPageObject(page)
        const dialogError = new DialogErrorPageObject(page)

        await folderButton.openFiles([
            "./app/codeCharta/resources/sample1_with_api_warning.cc.json",
            "./public/codeCharta/assets/empty.png"
        ])

        const dialogMessage = await dialogError.getMessage()
        expect(dialogMessage).toContain(` ${ERROR_MESSAGES.minorApiVersionOutdated} Found: 1.9`)
        expect(dialogMessage).toContain(` ${ERROR_MESSAGES.fileIsInvalid}`)
        await dialogError.clickOk()

        await folderButton.openFiles(["./app/codeCharta/assets/sample3.cc.json"])

        expect(await filePanel.getSelectedName()).toEqual("sample3")
    })

    test("should be able to open a cc.json with a lower minor api version without a warning", async ({ page }) => {
        const folderButton = new NavBarFolderButtonPageObject(page)
        const filePanel = new MapSelectorPageObject(page)

        await folderButton.openFiles(["./app/codeCharta/resources/sample1_with_lower_minor_api.cc.json"])

        expect(await filePanel.getSelectedName()).toEqual("sample1_with_lower_minor_api")
    })
})
