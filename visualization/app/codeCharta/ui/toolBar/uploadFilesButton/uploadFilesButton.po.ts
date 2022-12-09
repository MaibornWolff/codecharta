import { clickButtonOnPageElement } from "../../../../puppeteer.helper"

export class UploadFileButtonPageObject {
	async openFiles(paths: string[], clickOnFileChooser = true) {
		const [fileChooser] = await Promise.all([
			page.waitForFileChooser({ timeout: 60_000 }),
			clickOnFileChooser && clickButtonOnPageElement("[title='Load cc.json files']")
		])

		await fileChooser.accept(paths)

		await page.waitForSelector("#loading-gif-file")
		await page.waitForSelector("#loading-gif-file", { visible: false })
	}

	async cancelOpeningFile() {
		const [fileChooser] = await Promise.all([page.waitForFileChooser(), clickButtonOnPageElement("[title='Load cc.json files']")])

		fileChooser.cancel()
	}
}
