import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class LegendPanelObject {
    async open() {
        await clickButtonOnPageElement("cc-legend-panel .panel-button")
        await page.waitForSelector("cc-legend-panel .block-wrapper", { visible: true })
    }

    async getMultipleFilenames() {
        return page.$$eval("cc-legend-panel cc-legend-marked-packages cc-labelled-color-picker", elements =>
            elements.map(x => x.textContent.trim())
        )
    }
    async getFilename() {
        return page.$eval("cc-legend-panel cc-legend-marked-packages cc-labelled-color-picker", element => {
            return element["innerText"]
        })
    }

    async getEmptyLegendIfNoFilenamesExist() {
        return page.$eval("cc-legend-panel cc-legend-marked-packages", element => element["innerText"])
    }
}
