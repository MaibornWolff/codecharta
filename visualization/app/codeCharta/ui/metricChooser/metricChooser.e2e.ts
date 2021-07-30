import { goto } from "../../../puppeteer.helper"
import { MetricChooserPageObject } from "./metricChooser.po"
import pti from "puppeteer-to-istanbul"

describe("MapTreeViewLevel", () => {
	let metricChooser: MetricChooserPageObject

	beforeEach(async () => {
		metricChooser = new MetricChooserPageObject()
		await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()])

		await goto()
	})

	afterEach(async () => {
		const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()])
		pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: "./dist/e2eCoverage" })
	})

	describe("HeightChooser", () => {
		it("should unfocus and refocus the searchbar in height Metric Search", async () => {
			await metricChooser.openHeightMetricChooser()

			await metricChooser.clickOnHeightMetricSearch()

			expect(await metricChooser.isMetricChooserVisible()).toBeTruthy()
		})
	})
})
