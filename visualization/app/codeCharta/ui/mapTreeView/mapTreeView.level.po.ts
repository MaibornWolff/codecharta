export class MapTreeViewLevelPageObject {
	public async openContextMenu(path: string) {
		await expect(page).toClick(`[id='${path}']`, { button: "right", timeout: 3000 })
		await page.waitForSelector("node-context-menu-component", { visible: true })
	}

	public async openFolder(path: string) {
		await expect(page).toClick(`[id='${path}']`, { timeout: 3000 })
		await page.waitForSelector(`[id='${path}'] span.fa.fa-folder-open`)
	}

	public async hoverNode(path: string) {
		await page.waitForSelector(`[id='${path}']`)
		await page.hover(`[id='${path}']`)
		await page.waitForSelector(".tree-element-label.hovered")
	}

	public async nodeExists(path: string) {
		return !!(await page.$(`[id='${path}']`))
	}
}
