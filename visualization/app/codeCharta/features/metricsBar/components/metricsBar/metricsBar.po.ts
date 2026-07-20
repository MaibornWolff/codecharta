import { Locator, Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../../../playwright.helper"

export class MetricsBarPageObject {
    constructor(private page: Page) {}

    private readonly areaSearchPopoverId = "metric-select-popover-area"
    private readonly areaPopoverTestId = "metric-select-popover-metric-segment-area"
    private readonly areaSegmentTestId = "metric-segment-area"

    async openAreaMetricSelect() {
        await clickButtonOnPageElement(this.page, `button[popovertarget='${this.areaSearchPopoverId}']`)
        await this.page.locator(`[data-testid='${this.areaPopoverTestId}']`).waitFor({ state: "visible", timeout: 10_000 })
        // The popover's "toggle" handler clears the search term and then focuses the input, and it runs
        // after the popover becomes visible. Typing before it lands would have the reset overwrite the
        // term, so wait for the focus that marks the handler as done.
        await this.areaMetricSearchInput().waitFor({ state: "visible", timeout: 10_000 })
        await this.page.waitForFunction(
            selector => document.activeElement === document.querySelector(selector),
            `[data-testid='${this.areaPopoverTestId}'] input[type='text']`,
            { timeout: 10_000 }
        )
    }

    areaMetricSearchInput(): Locator {
        return this.page.locator(`[data-testid='${this.areaPopoverTestId}'] input[type='text']`)
    }

    async searchAreaMetric(term: string) {
        await this.areaMetricSearchInput().fill(term)
    }

    async getAreaMetricOptionNames() {
        return this.page
            .locator(`[data-testid='${this.areaPopoverTestId}'] button[data-metric-name]`)
            .evaluateAll(buttons => buttons.map(button => button.getAttribute("data-metric-name") ?? ""))
    }

    async selectAreaMetricOption(metricName: string) {
        await this.page.locator(`[data-testid='${this.areaPopoverTestId}'] button[data-metric-name='${metricName}']`).click()
    }

    /**
     * The element showing the area segment's selected metric. Prefer this with a web-first assertion
     * (`await expect(po.selectedAreaMetricName()).toHaveText(…)`) over reading the text: selecting a
     * metric dispatches a store update that lands a tick after the click, so a plain read races it.
     */
    selectedAreaMetricName(): Locator {
        return this.page.locator(`[data-testid='${this.areaSegmentTestId}'] .text-sm.font-semibold`).first()
    }

    async getSelectedAreaMetricName() {
        const text = await this.selectedAreaMetricName().innerText()
        return text.trim()
    }
}
