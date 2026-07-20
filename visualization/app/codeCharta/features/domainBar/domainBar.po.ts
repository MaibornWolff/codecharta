import { Page } from "@playwright/test"
import { WordCloudShape } from "../../model/wordCloud.model"

export class DomainBarPageObject {
    constructor(private page: Page) {}

    /** Each segment owns its own popover; open the one holding the control before interacting with it. */
    private async openPopover(cogTestId: string, controlTestId: string) {
        const control = this.page.locator(`[data-testid=${controlTestId}]`)
        if (!(await control.isVisible())) {
            await this.page.locator(`[data-testid=${cogTestId}]`).click()
            await control.waitFor({ state: "visible" })
        }
    }

    async openShapeSettings() {
        await this.openPopover("domain-bar-shape-cog", "domain-bar-shape")
    }

    async openWordSizingSettings() {
        await this.openPopover("domain-bar-toggle", "domain-bar-top-n")
    }

    async selectShape(shape: WordCloudShape) {
        await this.openShapeSettings()
        await this.shapeSelect().selectOption(shape)
    }

    async setTopN(value: number) {
        await this.openWordSizingSettings()
        // Type into the number field rather than dragging the slider: it commits on change, which also
        // flushes the shared input's debounce, so the store has the value by the time this resolves.
        await this.page.locator("[data-testid=domain-bar-top-n] input[type=number]").fill(String(value))
        await this.page.locator("[data-testid=domain-bar-top-n] input[type=number]").blur()
    }

    /** The top-N shown on the bar itself, read back from the store rather than from the input that wrote it. */
    topNValue() {
        return this.page.locator("[data-testid=domain-bar-top-n-value]")
    }

    shapeSelect() {
        return this.page.locator("[data-testid=domain-bar-shape]")
    }

    /** Resets are per group now — each popover resets only the settings it shows. */
    async resetWordSizing() {
        await this.openWordSizingSettings()
        await this.page.getByRole("button", { name: "Reset word sizing" }).click()
    }

    async resetShape() {
        await this.openShapeSettings()
        await this.page.getByRole("button", { name: "Reset shape" }).click()
    }
}
