export class MapTreeViewLevelPageObject {
	async openContextMenu(path: string) {
		await expect(page).toClick(`[id='${path}']`, { button: "right", timeout: 3000 })
		await page.waitForSelector("node-context-menu-component", { visible: true })
		await page.waitForSelector(".tree-element-label.marked")
	}

	async openFolder(path: string) {
		await expect(page).toClick(`[id='${path}']`, { timeout: 3000 })
		await page.waitForSelector(`[id='${path}'] span.fa.fa-folder-open`)
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
