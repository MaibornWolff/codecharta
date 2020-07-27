export class MapTreeViewLevelPageObject {
	public async openContextMenu(path: string) {
		await expect(page).toClick(`[id='${path}']`, { button: "right" })
	}

	public async openFolder(path: string) {
		await expect(page).toClick(`[id='${path}']`)
	}

	public async hoverNode(path: string) {
		await page.hover(`[id='${path}']`)
	}

	public async nodeExists(path: string) {
		return !!(await page.$(`[id='${path}']`))
	}
}
