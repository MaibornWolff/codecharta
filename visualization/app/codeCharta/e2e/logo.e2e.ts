import { clearIndexedDB, goto } from "../../puppeteer.helper"
import { LogoPageObject } from "./logo.po"
import packageJson from "../../../package.json"

describe("CodeCharta logo", () => {
	let logo: LogoPageObject

	beforeEach(async () => {
		logo = new LogoPageObject()

		await goto()
	})

	afterEach(async () => {
		await clearIndexedDB()
	})

	it("should have correct version", async () => {
		expect(await logo.getVersion()).toBe(packageJson.version)
	})

	it("should have correct link", async () => {
		expect(await logo.getLink()).toBe("https://github.com/MaibornWolff/codecharta")
	})

	it("should have correct image as logo", async () => {
		const source = await logo.getImageSrc()
		const viewSource = await page.goto(source)
		expect(await viewSource.buffer()).toMatchSnapshot()
	})
})
