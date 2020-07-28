export class MapTreeViewLevelPageObject {
	public async openContextMenu(path: string) {
		await expect(page).toClick(`[id='${path}']`, { button: "right", timeout: 3000 })
	}

	public async openFolder(path: string) {
		await expect(page).toClick(`[id='${path}']`, { timeout: 3000 })
	}

	public async hoverNode(path: string) {
		await page.waitForSelector(`[id='${path}']`)
		await page.hover(`[id='${path}']`)
	}

	public async nodeExists(path: string) {
		return !!(await page.$(`[id='${path}']`))
	}
}
