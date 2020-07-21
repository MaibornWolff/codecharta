import { Page } from "puppeteer"

export class FileChooserPageObject {
	constructor(private page: Page) {}

	public async openFile(path: string) {
		const [fileChooser] = await Promise.all([this.page.waitForFileChooser(), this.page.click("file-chooser-directive .toolbar-button")])

		await fileChooser.accept([path])
	}

	public async cancelOpeningFile() {
		const [fileChooser] = await Promise.all([this.page.waitForFileChooser(), this.page.click("file-chooser-directive .toolbar-button")])

		await fileChooser.cancel()
	}
}
