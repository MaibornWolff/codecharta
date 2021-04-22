import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class FileChooserPageObject {
	async openFiles(paths: string[], clickOnFileChooser = true) {
		const [fileChooser] = await Promise.all([
			page.waitForFileChooser({ timeout: 60000 }),
			clickOnFileChooser && clickButtonOnPageElement("file-chooser-directive .toolbar-button")
		])
		await fileChooser.accept(paths)

		await page.waitForSelector("#loading-gif-file")
		await page.waitForSelector("#loading-gif-file", { visible: false })
		await page.waitForTimeout(1000)
	}

	async cancelOpeningFile() {
		const [fileChooser] = await Promise.all([
			page.waitForFileChooser(),
			clickButtonOnPageElement("file-chooser-directive .toolbar-button")
		])

		await fileChooser.cancel()
	}
}
