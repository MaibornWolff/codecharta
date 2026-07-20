import { expect, Locator, Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../../playwright.helper"

export class ScenariosPageObject {
    constructor(private page: Page) {}

    async openScenarioList() {
        await clickButtonOnPageElement(this.page, "[title='Open saved scenarios']")
        await this.page.getByRole("dialog", { name: "Scenarios" }).waitFor({ state: "attached", timeout: 10_000 })
    }

    async openSaveDialog() {
        await clickButtonOnPageElement(this.page, "[title='Save current state as scenario']")
        await this.page.getByRole("dialog", { name: "Save Scenario" }).waitFor({ state: "attached", timeout: 10_000 })
    }

    /** A scenario row by name. `hasText` matches on textContent, so it finds rows in collapsed groups too. */
    scenarioListItem(name: string): Locator {
        return this.page.getByRole("dialog", { name: "Scenarios" }).locator("cc-scenario-item", { hasText: name })
    }

    async getScenarioNames() {
        const names = this.page.getByRole("dialog", { name: "Scenarios" }).locator("cc-scenario-item .font-medium")
        // The list is a radio-accordion — only the first group is expanded. Its items paint a change-detection
        // tick after the dialog attaches, so wait for the first one to have text before reading (every caller
        // of this method expects at least one visible scenario; the "no results" case checks the message instead).
        await expect(names.first()).not.toHaveText("", { timeout: 10_000 })
        return names.allInnerTexts()
    }

    async searchScenarios(term: string) {
        await this.page.getByRole("textbox", { name: "Search scenarios" }).fill(term)
    }

    async clickScenarioByName(name: string) {
        const dialog = this.page.getByRole("dialog", { name: "Scenarios" })
        await dialog.getByRole("button", { name: new RegExp(name) }).click()
    }

    /**
     * The apply-scenario dialog and its title. Use with web-first assertions
     * (`await expect(po.applyDialog()).toBeVisible()`): the dialog opens a change-detection tick after
     * the scenario is clicked, so reading a count or the text once races it.
     */
    applyDialog(): Locator {
        return this.page.locator("cc-apply-scenario-dialog dialog[open]")
    }

    applyDialogTitle(): Locator {
        return this.page.locator("cc-apply-scenario-dialog h2")
    }

    async closeScenarioList() {
        const dialog = this.page.getByRole("dialog", { name: "Scenarios" })
        await dialog.locator(".fa-close").click()
    }

    async saveScenario(name: string, description?: string) {
        const dialog = this.page.getByRole("dialog", { name: "Save Scenario" })
        await dialog.locator("#scenario-name").fill(name)
        if (description) {
            await dialog.locator("#scenario-description").fill(description)
        }
        await dialog.getByRole("button", { name: "Save" }).click()
        await dialog.waitFor({ state: "detached", timeout: 10_000 })
    }

    async deleteScenarioByName(name: string) {
        const listDialog = this.page.getByRole("dialog", { name: "Scenarios" })
        await listDialog.locator("cc-scenario-item", { hasText: name }).locator("[title='Delete scenario']").click()
        const confirmDialog = this.page.getByRole("dialog", { name: "Delete Scenario" })
        await confirmDialog.waitFor({ state: "attached", timeout: 10_000 })
        await confirmDialog.getByRole("button", { name: "Delete" }).click()
        await confirmDialog.waitFor({ state: "detached", timeout: 10_000 })
    }

    /** The empty-state message. Use with `await expect(po.noScenariosMessage()).toBeVisible()`. */
    noScenariosMessage(): Locator {
        return this.page.getByRole("dialog", { name: "Scenarios" }).getByText("No scenarios found.")
    }
}
