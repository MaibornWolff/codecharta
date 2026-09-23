import { expect, Locator, Page } from "@playwright/test"
import { MetricsBarPageObject } from "../../../metricsBar/components/metricsBar/metricsBar.po"

const FIRST_DESCRIBED_PATH = /the data for (\S+) is/

export class RadialMapPageObject {
    constructor(private readonly page: Page) {}

    chart(): Locator {
        return this.page.getByTestId("radial-chart")
    }

    async waitUntilCentredOn(path: string) {
        await expect.poll(async () => FIRST_DESCRIBED_PATH.exec((await this.chart().getAttribute("aria-label")) ?? "")?.[1]).toBe(path)
    }

    async switchLayoutTo(layout: string) {
        await new MetricsBarPageObject(this.page).switchLayoutTo(layout)
    }

    async rightClickAt(distanceFromCentreInRadii: number, degreesClockwiseFromTop = 90) {
        await this.clickAt(distanceFromCentreInRadii, degreesClockwiseFromTop, "right")
    }

    async clickAt(distanceFromCentreInRadii: number, degreesClockwiseFromTop = 90, button: "left" | "right" = "left") {
        await expect(this.chart()).toHaveAttribute("aria-busy", "false")
        await expect(this.chart()).toBeVisible()
        const box = await this.chart().boundingBox()
        if (!box) {
            throw new Error("The radial chart has no bounding box to click into")
        }
        const radius = Math.min(box.width, box.height) / 2
        const angle = (degreesClockwiseFromTop * Math.PI) / 180
        await this.page.mouse.click(
            box.x + box.width / 2 + radius * distanceFromCentreInRadii * Math.sin(angle),
            box.y + box.height / 2 - radius * distanceFromCentreInRadii * Math.cos(angle),
            { button }
        )
    }
}
