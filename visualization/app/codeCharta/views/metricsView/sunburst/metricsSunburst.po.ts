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

    persistedLayout(): Promise<string | undefined> {
        return this.page.evaluate(
            () =>
                new Promise<string | undefined>(resolve => {
                    const open = indexedDB.open("CodeCharta")
                    open.onerror = () => resolve(undefined)
                    open.onsuccess = () => {
                        const database = open.result
                        if (!database.objectStoreNames.contains("ccstate")) {
                            database.close()
                            resolve(undefined)
                            return
                        }
                        const settingsRecord = database.transaction("ccstate", "readonly").objectStore("ccstate").get(1001)
                        settingsRecord.onsuccess = () => {
                            database.close()
                            resolve(settingsRecord.result?.state?.mapState?.layoutAlgorithm)
                        }
                        settingsRecord.onerror = () => {
                            database.close()
                            resolve(undefined)
                        }
                    }
                })
        )
    }

    async clickAt(distanceFromCentreInRadii: number) {
        await this.page.waitForTimeout(RING_ANIMATION_MS)
        const box = await this.chart().boundingBox()
        const radius = Math.min(box.width, box.height) / 2
        await this.page.mouse.click(box.x + box.width / 2 + radius * distanceFromCentreInRadii, box.y + box.height / 2)
    }
}
