import { EdgeMetricCount } from "../../../codeCharta.model"
import { clickButtonOnPageElement } from "../../../../puppeteer.helper"

export class EdgeChooserPageObject {
    async open() {
        await clickButtonOnPageElement("cc-edge-metric-chooser mat-select")
        await page.waitForSelector("mat-option")
    }

    async getMetrics() {
        await page.waitForSelector("mat-option")
        return page.$$eval("mat-option", metrics => metrics.map(x => x.textContent))
    }

    async isEdgeCountAvailable() {
        const innerText = await this.getEdgeCountInnerText()

        // Check if the text contains a number.
        return /\d/.test(innerText)
    }

    async getAmountOfEdges(): Promise<EdgeMetricCount> {
        const innerText = await this.getEdgeCountInnerText()
        const edgeCount = innerText.split("/")

        return { incoming: Number(edgeCount[0]), outgoing: Number(edgeCount[1]) }
    }

    private async getEdgeCountInnerText() {
        const edgeCountSelector = "cc-edge-metric-chooser [hoveredInformation]"
        await page.waitForSelector(edgeCountSelector)
        return page.$eval(edgeCountSelector, element => element["innerText"])
    }
}
