import { goto } from "../../puppeteer.helper"
import { LogoPageObject } from "./logo.po"
import packageJson from "../../../package.json"
import pti from "puppeteer-to-istanbul"

describe("CodeCharta logo", () => {
	let logo: LogoPageObject

	beforeEach(async () => {
		logo = new LogoPageObject()

		await goto()
	})

	it("should have correct version", async () => {
		await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()])

		expect(await logo.getVersion()).toBe(packageJson.version)

		const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()])
		pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: "./.nyc_output" })
	})

	it("should have correct link", async () => {
		await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()])

		expect(await logo.getLink()).toContain("maibornwolff.de")

		const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()])
		pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: "./.nyc_output" })
	})

	it("should have correct image as logo", async () => {
		await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()])

		const source = await logo.getImageSrc()
		const viewSource = await page.goto(source)
		expect(await viewSource.buffer()).toMatchSnapshot()

		const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()])
		pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: "./.nyc_output" })
	})
})
