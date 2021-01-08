export class FilePanelPageObject {
	async getSelectedName() {
		await page.waitForSelector("file-panel-component md-select .md-text")
		return page.$eval("file-panel-component md-select .md-text", element => element["innerText"])
	}

	async clickChooser() {
		await expect(page).toClick("file-panel-component md-select") // timeout added globally in puppeteer.helper.ts
	}

	async getAllNames() {
		await this.clickChooser()
		await this.printSnapShot("##################################")
		await page.waitForSelector(".md-select-menu-container.md-active > md-select-menu");
		await this.printSnapShot("----------------------------------")

		const content = await page.$eval(".md-select-menu-container.md-active > md-select-menu", element => element["innerText"])
		return content.split("\n")
	}

	async printSnapShot(tag) {
		const snapshot = await page.accessibility.snapshot()

		const node = this.findFocusedNode(snapshot);
		// @ts-ignore
		// eslint-disable-next-line no-console
		console.log(tag)
		// @ts-ignore
		// eslint-disable-next-line no-console
		console.log(node?.name);
		// @ts-ignore
		// eslint-disable-next-line no-console
		console.log(snapshot)
	}

	findFocusedNode =(node) => {
		if (node.focused)
		  return node;
		for (const child of node.children || []) {
		  const foundNode = this.findFocusedNode(child);
		  return foundNode;
		}
		return null;
	  }
}
