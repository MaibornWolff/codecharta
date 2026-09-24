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

    countPixelsOfColor(hex: string): Promise<number> {
        return this.chart()
            .locator("canvas")
            .first()
            .evaluate((canvas: HTMLCanvasElement, color: string) => {
                const [red, green, blue] = [1, 3, 5].map(start => Number.parseInt(color.slice(start, start + 2), 16))
                const { data } = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)
                let count = 0
                for (let index = 0; index < data.length; index += 4) {
                    if (data[index] === red && data[index + 1] === green && data[index + 2] === blue) {
                        count++
                    }
                }
                return count
            }, hex)
    }

    pixelFingerprint(): Promise<string> {
        return this.chart()
            .locator("canvas")
            .first()
            .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())
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
