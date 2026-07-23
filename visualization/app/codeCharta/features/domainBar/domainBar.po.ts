import { Page } from "@playwright/test"
import { WordCloudShape } from "../../model/wordCloud.model"

export class DomainBarPageObject {
    constructor(private page: Page) {}

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
        await this.openPopover("domain-bar-word-sizing-cog", "domain-bar-top-n")
    }

    async selectShape(shape: WordCloudShape) {
        await this.openShapeSettings()
        await this.shapeSelect().selectOption(shape)
    }

    async setTopN(value: number) {
        await this.openWordSizingSettings()
        await this.page.locator("[data-testid=domain-bar-top-n] input[type=number]").fill(String(value))
        await this.page.locator("[data-testid=domain-bar-top-n] input[type=number]").blur()
    }

    topNValue() {
        return this.page.locator("[data-testid=domain-bar-top-n-value]")
    }

    shapeSelect() {
        return this.page.locator("[data-testid=domain-bar-shape]")
    }

    async resetWordSizing() {
        await this.openWordSizingSettings()
        await this.page.getByRole("button", { name: "Reset word sizing" }).click()
    }

    async resetShape() {
        await this.openShapeSettings()
        await this.page.getByRole("button", { name: "Reset shape" }).click()
    }
}
