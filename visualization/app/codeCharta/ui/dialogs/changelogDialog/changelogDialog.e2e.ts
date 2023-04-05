import { goto } from "../../../../puppeteer.helper"
import changelog from "../../../../../../CHANGELOG.md"

function getSecondLatestCodeChartaVersion() {
	const versionPattern = /\[(\d+\.\d+\.\d+)]/g
	const versions = changelog.match(versionPattern) || []
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
		const changelogDialog = await page.waitForSelector(".mat-mdc-dialog-container", { timeout: 6000 })
		const contentElement = await changelogDialog?.waitForSelector(".content")
		const changelogContent = await contentElement?.evaluate(element => element.textContent)

		expect(changelogContent?.length).not.toBe(0)
	})
})
