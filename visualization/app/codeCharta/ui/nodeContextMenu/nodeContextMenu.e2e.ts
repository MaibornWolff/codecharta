import { CC_URL, puppeteer } from "../../../puppeteer.helper"
import { NodeContextMenuPageObject } from "./nodeContextMenu.po";
import { SettingsPanelPageObject } from "../settingsPanel/settingsPanel.po";

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
        const settingsPanel = new SettingsPanelPageObject(page);
		await settingsPanel.open();
		await settingsPanel.toggleTreeViewSearchPanel();
		await settingsPanel.rightClickRootNodeInTreeViewSearchPanel();
        const contextMenu = new NodeContextMenuPageObject(page);
        expect(await contextMenu.hasColorButtons()).toBeTruthy();
	})
})
