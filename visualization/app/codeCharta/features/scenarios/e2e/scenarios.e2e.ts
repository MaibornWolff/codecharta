import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../playwright.helper"
import { MetricsBarPageObject } from "../../metricsBar/components/metricsBar/metricsBar.po"
import { ScenariosPageObject } from "./scenarios.po"

test.describe("Scenarios", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should show built-in scenarios when dialog opens", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        await scenarios.openScenarioList()

        const names = await scenarios.getScenarioNames()
        expect(names.length).toBeGreaterThanOrEqual(1)
        expect(names.some(n => n.includes("Real Lines of Code"))).toBe(true)
    })

    test("should save a scenario and show it in the list", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        await scenarios.openSaveDialog()
        await scenarios.saveScenario("My Test Scenario", "A test description")

        await scenarios.openScenarioList()
        await expect(scenarios.scenarioListItem("My Test Scenario")).toBeVisible()
    })

    test("should open apply dialog with setting checkboxes when clicking a scenario", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        await scenarios.openScenarioList()
        await scenarios.clickScenarioByName("Real Lines of Code")

        await expect(scenarios.applyDialog()).toBeVisible()
        await expect(scenarios.applyDialogTitle()).toHaveText("Apply: Real Lines of Code")
        await expect(scenarios.applySettingCheckbox("areaMetric")).toBeChecked()
    })

    test("should leave out the settings that were unchecked while saving", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        await scenarios.openSaveDialog()
        await scenarios.openExtendedSaveSettings()
        await scenarios.toggleSaveSettingGroup("color")
        await scenarios.saveScenario("Without colors")

        await scenarios.openScenarioList()
        await scenarios.clickScenarioByName("Without colors")

        await expect(scenarios.applySettingCheckbox("margin")).toBeChecked()
        await expect(scenarios.applySettingCheckbox("colorRange")).toHaveCount(0)
    })

    test("should apply the settings a scenario carries", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)
        const metricsBar = new MetricsBarPageObject(page)

        await metricsBar.openAreaMetricSelect()
        await metricsBar.selectAreaMetricOption("sonar_complexity")
        expect(await metricsBar.getSelectedAreaMetricName()).toBe("sonar_complexity")

        await scenarios.openScenarioList()
        await scenarios.clickScenarioByName("Real Lines of Code")
        await scenarios.applyScenario()

        await expect(metricsBar.selectedAreaMetricName()).toHaveText("rloc")
    })

    test("should filter scenarios by search term", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        await scenarios.openScenarioList()
        await scenarios.searchScenarios("Complexity")

        await expect
            .poll(async () => {
                const names = await scenarios.getScenarioNames()
                return names.length > 0 && names.every(name => name.toLowerCase().includes("complexity"))
            })
            .toBe(true)
    })

    test("should show no results message when search has no matches", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        await scenarios.openScenarioList()
        await scenarios.searchScenarios("zzz_nonexistent_scenario_xyz")

        await expect(scenarios.noScenariosMessage()).toBeVisible()
    })

    test("should delete a user scenario and verify removal", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        // Save a scenario first
        await scenarios.openSaveDialog()
        await scenarios.saveScenario("To Be Deleted")

        // Open list and verify it exists
        await scenarios.openScenarioList()
        await expect(scenarios.scenarioListItem("To Be Deleted")).toBeVisible()

        // Delete it
        await scenarios.deleteScenarioByName("To Be Deleted")

        // Verify removal
        await expect(scenarios.scenarioListItem("To Be Deleted")).toHaveCount(0)
    })
})
