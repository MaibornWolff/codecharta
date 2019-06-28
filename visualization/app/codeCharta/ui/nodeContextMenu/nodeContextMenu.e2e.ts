import { CC_URL, delay, puppeteer } from "../../../puppeteer.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po"
import { SettingsPanelPageObject } from "../settingsPanel/settingsPanel.po"
import { Browser, Page } from "puppeteer"

jest.setTimeout(10000)

describe("NodeContextMenu", () => {
	let browser : Browser
	let page : Page

	let settingsPanel : SettingsPanelPageObject
	let contextMenu : NodeContextMenuPageObject

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()
		settingsPanel = new SettingsPanelPageObject(page)
		contextMenu = new NodeContextMenuPageObject(page)

		await page.goto(CC_URL)
		await delay(1000)
	})

	it("right clicking a folder should open a context menu with color options", async () => {
		await settingsPanel.open()
		await settingsPanel.toggleTreeViewSearchPanel()
		await settingsPanel.rightClickRootNodeInTreeViewSearchPanel()

		expect(await contextMenu.hasColorButtons()).toBeTruthy()
	})
})
