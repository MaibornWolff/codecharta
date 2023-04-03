import { goto } from "../../../../puppeteer.helper"
import fs from "fs"
import path from "path"

function getSecondLatestCodeChartaVersion() {
	const changelog = fs.readFileSync(path.resolve(__dirname, "../../../../../../CHANGELOG.md"), "utf8")
	const versionPattern = /\[(\d+\.\d+\.\d+)]/g
	const versions = changelog?.match(versionPattern) || []
	const secondLatestVersion = versions[1]?.slice(1, -1)
	return secondLatestVersion
}

describe("changelogDialog", () => {
	beforeEach(async () => {
		const version = getSecondLatestCodeChartaVersion() ?? ""
		await page.evaluateOnNewDocument(version => {
			localStorage.setItem("codeChartaVersion", version)
		}, version)
		await goto()
	})

	it("should show entries between the last und newest release version", async () => {
		const changelogDialog = await page.waitForSelector(".mat-mdc-dialog-container")
		const contentElement = await changelogDialog?.waitForSelector(".content")
		const changelogContent = await contentElement?.evaluate(element => element.textContent)

		expect(changelogContent?.length).not.toBe(0)
	})
})
