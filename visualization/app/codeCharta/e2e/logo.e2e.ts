import { goto } from "../../puppeteer.helper"
import { LogoPageObject } from "./logo.po"
import packageJson from "../../../package.json"
//import pti from "puppeteer-to-istanbul"

describe("CodeCharta logo", () => {
	let logo: LogoPageObject

	beforeEach(async () => {
		logo = new LogoPageObject()
		//await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()])
		await goto()
	})

	afterEach(async () => {
		//const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()])
		//pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: "./dist/coverage/e2eCoverage" })
	})

	it("should have correct version", async () => {
		expect(await logo.getVersion()).toBe(packageJson.version)
	})

	it("should have correct link", async () => {
		expect(await logo.getLink()).toContain("maibornwolff.de")
	})

	it("should have correct image as logo", async () => {
		const source = await logo.getImageSrc()
		const viewSource = await page.goto(source)
		expect(await viewSource.buffer()).toMatchSnapshot()
	})
})
