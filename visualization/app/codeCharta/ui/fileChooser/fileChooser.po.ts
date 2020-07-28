import { waitForElementRemoval } from "../../../puppeteer.helper"

export class FileChooserPageObject {
	public async openFile(path: string) {
		const [fileChooser] = await Promise.all([page.waitForFileChooser(), expect(page).toClick("file-chooser-directive .toolbar-button")])

		await fileChooser.accept([path])

		await page.waitForSelector("#loading-gif-file")
		await waitForElementRemoval("#loading-gif-file")
	}

	public async cancelOpeningFile() {
		const [fileChooser] = await Promise.all([page.waitForFileChooser(), expect(page).toClick("file-chooser-directive .toolbar-button")])

		await fileChooser.cancel()
	}
}
