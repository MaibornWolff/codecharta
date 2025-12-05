import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../playwright.helper"
import { EdgeChooserPageObject } from "./edgeChooser.po"
import { MapTreeViewLevelPageObject } from "../searchPanel/mapTreeView/mapTreeView.level.po"
import { SearchPanelPageObject } from "../searchPanel/searchPanel.po"
import { UploadFileButtonPageObject } from "../../toolBar/uploadFilesButton/uploadFilesButton.po"

test.describe("MapTreeViewLevel", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test.describe("EdgeChooser", () => {
        test("should update metrics correctly after switching to a map with different metrics", async ({ page }) => {
            const edgeChooser = new EdgeChooserPageObject(page)
            const uploadFilesButton = new UploadFileButtonPageObject(page)

            await uploadFilesButton.openFiles(["./app/codeCharta/resources/sample1_with_different_edges.cc.json"])
            await edgeChooser.open()
            const metrics = await edgeChooser.getMetrics()

            expect(metrics).toHaveLength(2)
        })

        test("should not display the amount of incoming and outgoing edges of buildings for the none metric", async ({ page }) => {
            const edgeChooser = new EdgeChooserPageObject(page)
            const mapTreeViewLevel = new MapTreeViewLevelPageObject(page)
            const searchPanel = new SearchPanelPageObject(page)

            await searchPanel.toggle()
            await mapTreeViewLevel.openFolder("/root/sample2.cc.json")
            await mapTreeViewLevel.openFolder("/root/sample2.cc.json/ParentLeaf")
            await mapTreeViewLevel.hoverNode("/root/sample2.cc.json/ParentLeaf/smallLeaf.html")

            expect(await edgeChooser.isEdgeCountAvailable()).toBeFalsy()
        })
    })
})
