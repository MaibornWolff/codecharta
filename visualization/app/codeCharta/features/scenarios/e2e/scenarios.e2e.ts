import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../playwright.helper"
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
        const names = await scenarios.getScenarioNames()
        expect(names.some(n => n.includes("My Test Scenario"))).toBe(true)
    })

    test("should open apply dialog with section checkboxes when clicking a scenario", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        await scenarios.openScenarioList()
        await scenarios.clickScenarioByName("Real Lines of Code")

        expect(await scenarios.isApplyDialogVisible()).toBe(true)
        const title = await scenarios.getApplyDialogTitle()
        expect(title).toContain("Real Lines of Code")
    })

    test("should filter scenarios by search term", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        await scenarios.openScenarioList()
        await scenarios.searchScenarios("Complexity")

        const names = await scenarios.getScenarioNames()
        expect(names.length).toBeGreaterThanOrEqual(1)
        for (const name of names) {
            expect(name.toLowerCase()).toContain("complexity")
        }
    })

    test("should show no results message when search has no matches", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        await scenarios.openScenarioList()
        await scenarios.searchScenarios("zzz_nonexistent_scenario_xyz")

        expect(await scenarios.isNoScenariosMessageVisible()).toBe(true)
    })

    test("should delete a user scenario and verify removal", async ({ page }) => {
        const scenarios = new ScenariosPageObject(page)

        // Save a scenario first
        await scenarios.openSaveDialog()
        await scenarios.saveScenario("To Be Deleted")

        // Open list and verify it exists
        await scenarios.openScenarioList()
        let names = await scenarios.getScenarioNames()
        expect(names.some(n => n.includes("To Be Deleted"))).toBe(true)

        // Delete it
        await scenarios.deleteScenarioByName("To Be Deleted")

        // Verify removal
        names = await scenarios.getScenarioNames()
        expect(names.some(n => n.includes("To Be Deleted"))).toBe(false)
    })
})
