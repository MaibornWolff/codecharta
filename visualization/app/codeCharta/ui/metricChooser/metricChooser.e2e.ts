import { goto } from "../../../puppeteer.helper"
import { MetricChooserPageObject } from "./metricChooser.po"

describe("MapTreeViewLevel", () => {
	let metricChooser: MetricChooserPageObject

	beforeEach(async () => {
		metricChooser = new MetricChooserPageObject()

		await goto()
	})

	describe("HeightChooser", () => {
		it("should unfocus and refocus the searchbar in height Metric Search", async () => {
			await metricChooser.openHeightMetricChooser()

			await metricChooser.clickOnHeightMetricSearch()

			expect(await metricChooser.isMetricChooserVisible()).toBeTruthy()
		})
	})
})
