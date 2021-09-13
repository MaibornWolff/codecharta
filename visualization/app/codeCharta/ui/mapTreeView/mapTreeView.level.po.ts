import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class MapTreeViewLevelPageObject {
	async openContextMenu(path: string) {
		await clickButtonOnPageElement(`[id='${path}']`, { button: "right" })
		try {
			await page.waitForSelector("node-context-menu-component", { visible: true })
			await page.waitForSelector(".tree-element-label.marked")
		} catch {
			await clickButtonOnPageElement(`[id='${path}']`, { button: "right" })
		}
	}

	async openFolder(path: string) {
		await clickButtonOnPageElement(`[id='${path}']`)
		try {
			await page.waitForSelector(`[id='${path}'] span.fa.fa-folder-open`)
		} catch {
			await clickButtonOnPageElement(`[id='${path}']`)
		}
	}

	async hoverNode(path: string) {
		await page.waitForSelector(`[id='${path}']`)
		await page.hover(`[id='${path}']`)
		await page.waitForSelector(`[id='${path}'].hovered`)
	}

	async nodeExists(path: string) {
		return Boolean(await page.$(`[id='${path}']`))
	}

	async isNodeMarked(path: string) {
		return page.waitForSelector(`[id='${path}'].marked`)
	}

	async getNumberOfFiles(path: string) {
		return page.$eval(`[id='${path}'] .unary-number`, element => Number(element["innerText"].split(" ")[0]))
	}
}
