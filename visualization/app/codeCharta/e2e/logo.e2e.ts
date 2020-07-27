import { goto } from "../../puppeteer.helper"
import { LogoPageObject } from "./logo.po"

describe("CodeCharta logo", () => {
	let logo: LogoPageObject

	beforeAll(async () => {})

	beforeEach(async () => {
		await goto()

		logo = new LogoPageObject(page)
	})

	it("should have correct version", async () => {
		expect(await logo.getVersion()).toBe(require("../../../package.json").version)
	})

	it("should have correct link", async () => {
		expect(await logo.getLink()).toContain("maibornwolff.de")
	})

	it("should have correct image as logo", async () => {
		const src = await logo.getImageSrc()
		const viewSource = await page.goto(src)
		expect(await viewSource.buffer()).toMatchSnapshot()
	})
})
