import { Page } from "puppeteer"
import { delay } from "../../../puppeteer.helper"

export class FileChooserPageObject {
	constructor(private page: Page) {}

	public async openFile(path: string) {
		const inputUploadHandle = await this.page.$("input[type=file]")
		await inputUploadHandle.uploadFile(path)

		const [fileChooser] = await Promise.all([this.page.waitForFileChooser(), this.page.click("file-chooser-directive .toolbar-button")])

		await fileChooser.accept([path])
		await delay(2000)
	}

	public async cancelOpeningFile() {
		const [fileChooser] = await Promise.all([this.page.waitForFileChooser(), this.page.click("file-chooser-directive .toolbar-button")])

		await fileChooser.cancel()
		await delay(1000)
	}
}
