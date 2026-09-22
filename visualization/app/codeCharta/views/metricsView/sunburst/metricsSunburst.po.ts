import { Locator, Page } from "@playwright/test"

const RING_ANIMATION_MS = 800

export class MetricsSunburstPageObject {
    constructor(private readonly page: Page) {}

    chart(): Locator {
        return this.page.getByTestId("sunburst-chart")
    }

    async switchLayoutTo(layout: string) {
        await this.page.getByTitle("Global Configuration").first().click()
        await this.page.locator("#mapLayoutSelect").selectOption(layout)
        await this.page.keyboard.press("Escape")
    }

    async clickAt(distanceFromCentreInRadii: number, degreesClockwiseFromTop = 90) {
        await this.page.waitForTimeout(RING_ANIMATION_MS)
        const box = await this.chart().boundingBox()
        const radius = Math.min(box.width, box.height) / 2
        const angle = (degreesClockwiseFromTop * Math.PI) / 180
        await this.page.mouse.click(
            box.x + box.width / 2 + radius * distanceFromCentreInRadii * Math.sin(angle),
            box.y + box.height / 2 - radius * distanceFromCentreInRadii * Math.cos(angle)
        )
    }
}
