import { CC_URL, delay, puppeteer } from "../../../puppeteer.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po"
import { SettingsPanelPageObject } from "../settingsPanel/settingsPanel.po"

jest.setTimeout(10000)

describe("app", () => {
	let browser, page

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
		page = await browser.newPage()
	})

	afterAll(async () => {
		await browser.close()
	})

	it("right clicking a folder should open a context menu with color options", async () => {
		await page.goto(CC_URL)
		await page.evaluate(() => {
			const loadingIndicator = document.querySelector("#loading-gif-file")
			loadingIndicator.parentNode.removeChild(loadingIndicator)
		})
		await delay(500)
		const settingsPanel = new SettingsPanelPageObject(page)
		await settingsPanel.open()
		await settingsPanel.toggleTreeViewSearchPanel()
		await settingsPanel.rightClickRootNodeInTreeViewSearchPanel()
		const contextMenu = new NodeContextMenuPageObject(page)
		expect(await contextMenu.hasColorButtons()).toBeTruthy()
	})
})
