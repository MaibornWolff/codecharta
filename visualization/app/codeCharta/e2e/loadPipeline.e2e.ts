import { expect, test } from "@playwright/test"
import { CC_URL, clearIndexedDB, collapseExplorer, goto, waitForCcStatePersisted, withDiskBackedPage } from "../../playwright.helper"
import sample1 from "../assets/sample1.cc.json"
import sample2 from "../assets/sample2.cc.json"
import { MetricsBarPageObject } from "../features/metricsBar/components/metricsBar/metricsBar.po"
import { MapSelectorPageObject } from "../features/navBar/components/mapSelector/mapSelector.po"

/**
 * The load pipeline end to end. Every one of these goes through LoadFilesUseCase and the post-load
 * reconciliation sequence, and each covers a path that the unit tests cannot: the spinner clearing
 * (goto() fails if #loading-gif-file never hides), the URL write-back, and the file-panel triggers
 * that must keep running the sequence without a load.
 */
test.describe("load pipeline", () => {
    const routeSampleFiles = async page => {
        await page.route("**/*", async route => {
            const url = route.request().url()
            if (url.includes("/fileOne.json")) {
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify(sample1)
                })
            } else if (url.includes("/fileTwo.json")) {
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify(sample2)
                })
            } else {
                await route.continue()
            }
        })
    }

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should load the sample files on a first run without a file parameter", async ({ page }) => {
        // Act
        await goto(page)

        // Assert
        const filePanel = new MapSelectorPageObject(page)
        expect(await filePanel.getSelectedName()).toBeTruthy()
    })

    test("should restore the previously loaded file from indexeddb on a boot without a file parameter", async () => {
        // The fixture page's in-memory IndexedDB can vanish between the two boots (a macOS-only
        // flake), so this test runs on a disk-backed page — the extra browser launch it brings
        // needs headroom beyond the default timeout.
        test.setTimeout(30_000)
        await withDiskBackedPage(async page => {
            // Arrange — load a file from the url, then wait until it is actually persisted (the save is
            // debounced, so a reload can otherwise outrace the write and boot from an empty database)
            await routeSampleFiles(page)
            await goto(page, `${CC_URL}?file=fileOne.json`)
            const filePanel = new MapSelectorPageObject(page)
            const nameAfterUrlLoad = await filePanel.getSelectedName()
            await waitForCcStatePersisted(page, nameAfterUrlLoad)

            // Act — boot again WITHOUT the file parameter: the persisted state must come back
            await goto(page, CC_URL)

            // Assert
            expect(await filePanel.getSelectedName()).toEqual(nameAfterUrlLoad)
        })
    })

    test("should apply the metric from the url and write the resolved metrics back into the url", async ({ page }) => {
        // Arrange
        await routeSampleFiles(page)
        const metricsBar = new MetricsBarPageObject(page)

        // Act — "functions" exists in the file, but is not what the default combination would pick
        await goto(page, `${CC_URL}?file=fileOne.json&area=functions`)

        // Assert — the url wins over the computed default...
        await expect(metricsBar.selectedAreaMetricName()).toHaveText("functions")

        // ...and the resolved selection is written back
        await expect.poll(() => page.url()).toContain("area=functions")
        await expect.poll(() => page.url()).toContain("height=")
        await expect.poll(() => page.url()).toContain("color=")
    })

    test("should fall back to the computed default when the url names a metric the file does not have", async ({ page }) => {
        // Arrange
        await routeSampleFiles(page)
        const metricsBar = new MetricsBarPageObject(page)

        // Act
        await goto(page, `${CC_URL}?file=fileOne.json&area=this_metric_does_not_exist`)

        // Assert — dropped silently, and a real metric is selected instead
        const areaMetric = await metricsBar.getSelectedAreaMetricName()
        expect(areaMetric).not.toEqual("this_metric_does_not_exist")
        expect(areaMetric).toBeTruthy()
    })

    test("should reset the metric selection back to the default when the map is reset", async ({ page }) => {
        // Arrange — pick a metric that is NOT what the default combination would choose. The metrics bar
        // sits behind the open explorer, so collapse it first.
        await goto(page)
        await collapseExplorer(page)
        const metricsBar = new MetricsBarPageObject(page)
        await metricsBar.openAreaMetricSelect()
        await metricsBar.selectAreaMetricOption("functions")
        await expect(metricsBar.selectedAreaMetricName()).toHaveText("functions")

        // Act — Global Configuration → Reset map to default → Yes
        await page.locator('button[title="Global Configuration"]').click()
        await page.getByRole("button", { name: "Reset map" }).click()
        await page.getByText("Yes").click()
        await page.locator("#loading-gif-file").waitFor({ state: "hidden", timeout: 60_000 })

        // Assert — the button promises to reset the selected metrics, so it must
        await expect(metricsBar.selectedAreaMetricName()).not.toHaveText("functions")
    })

    test("should re-run the reconciliation when the file selection changes without a load", async ({ page }) => {
        // Arrange — two files loaded from the url, both visible
        await routeSampleFiles(page)
        await goto(page, `${CC_URL}?file=fileOne.json&file=fileTwo.json`)
        const metricsBar = new MetricsBarPageObject(page)
        expect(await metricsBar.getSelectedAreaMetricName()).toBeTruthy()

        // Act — deselect one file in the file panel. This is NOT a load: it changes the visible file
        // set only, and the sequence has to run for it anyway (spinner up, map rebuilt, spinner down).
        const trigger = page.locator("cc-map-selector .dropdown > button")
        await trigger.click()
        const checkboxes = page.locator("cc-map-selector .dropdown-content ul li input[type='checkbox']")
        await checkboxes.first().waitFor({ state: "visible" })
        await checkboxes.nth(1).uncheck()
        await trigger.click()

        // Assert — the spinner comes back down and the map still has a valid metric selection
        await page.locator("#loading-gif-file").waitFor({ state: "hidden", timeout: 60_000 })
        expect(await metricsBar.getSelectedAreaMetricName()).toBeTruthy()
    })
})
