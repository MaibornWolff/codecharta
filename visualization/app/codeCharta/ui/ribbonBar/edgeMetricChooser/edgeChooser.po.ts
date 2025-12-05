import { Page } from "@playwright/test"
import { EdgeMetricCount } from "../../../codeCharta.model"
import { clickButtonOnPageElement } from "../../../../playwright.helper"

export class EdgeChooserPageObject {
    constructor(private page: Page) {}

    async open() {
        const selector = "cc-edge-metric-chooser mat-select"
        await this.page.locator(selector).waitFor({ state: "visible", timeout: 10_000 })
        // Wait for map loading to complete before interacting
        await this.page.locator("#loading-gif-map").waitFor({ state: "hidden", timeout: 30_000 })
        // Click directly on the mat-select value text, bypassing overlapping elements
        await this.page.locator("cc-edge-metric-chooser .mat-mdc-select-value-text").click({ force: true })
        await this.page.locator("mat-option").first().waitFor({ state: "visible", timeout: 10_000 })
    }

    async getMetrics() {
        await this.page.locator("mat-option").first().waitFor({ state: "visible" })
        const options = this.page.locator("mat-option")
        const count = await options.count()
        const metrics: string[] = []
        for (let i = 0; i < count; i++) {
            const text = await options.nth(i).innerText()
            metrics.push(text)
        }
        return metrics
    }

    async isEdgeCountAvailable() {
        const innerText = await this.getEdgeCountInnerText()
        return /\d/.test(innerText)
    }

    async getAmountOfEdges(): Promise<EdgeMetricCount> {
        const innerText = await this.getEdgeCountInnerText()
        const edgeCount = innerText.split("/")
        return { incoming: Number(edgeCount[0]), outgoing: Number(edgeCount[1]) }
    }

    private async getEdgeCountInnerText() {
        const edgeCountSelector = "cc-edge-metric-chooser [hoveredInformation]"
        await this.page.locator(edgeCountSelector).waitFor({ state: "attached" })
        return this.page.locator(edgeCountSelector).innerText()
    }
}
