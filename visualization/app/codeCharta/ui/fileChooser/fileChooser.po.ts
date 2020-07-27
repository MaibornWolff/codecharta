import { Page } from "puppeteer"
import { click } from "../../../puppeteer.helper"

export class FileChooserPageObject {
	constructor(private page: Page) {}

	public async openFile(path: string) {
		const [fileChooser] = await Promise.all([this.page.waitForFileChooser(), click("file-chooser-directive .toolbar-button")])

		await fileChooser.accept([path])
		await this.page.waitFor(200)
	}

	public async cancelOpeningFile() {
		const [fileChooser] = await Promise.all([this.page.waitForFileChooser(), click("file-chooser-directive .toolbar-button")])

		await fileChooser.cancel()
		await this.page.waitFor(200)
	}
}
