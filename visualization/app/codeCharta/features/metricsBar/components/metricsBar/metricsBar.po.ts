import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../../../playwright.helper"

export class MetricsBarPageObject {
    constructor(private page: Page) {}

    private readonly areaSearchPopoverId = "metric-select-popover-area"
    private readonly areaPopoverTestId = "metric-select-popover-metric-segment-area"
    private readonly areaSegmentTestId = "metric-segment-area"

    async openAreaMetricSelect() {
        await clickButtonOnPageElement(this.page, `button[popovertarget='${this.areaSearchPopoverId}']`)
        await this.page.locator(`[data-testid='${this.areaPopoverTestId}']`).waitFor({ state: "visible", timeout: 10_000 })
    }

    async searchAreaMetric(term: string) {
        await this.page.locator(`[data-testid='${this.areaPopoverTestId}'] input[type='text']`).fill(term)
    }

    async getAreaMetricOptionNames() {
        return this.page
            .locator(`[data-testid='${this.areaPopoverTestId}'] button[data-metric-name]`)
            .evaluateAll(buttons => buttons.map(button => button.getAttribute("data-metric-name") ?? ""))
    }

    async selectAreaMetricOption(metricName: string) {
        await this.page.locator(`[data-testid='${this.areaPopoverTestId}'] button[data-metric-name='${metricName}']`).click()
    }

    async getSelectedAreaMetricName() {
        const segment = this.page.locator(`[data-testid='${this.areaSegmentTestId}']`)
        const text = await segment.locator(".text-sm.font-semibold").first().innerText()
        return text.trim()
    }
}
