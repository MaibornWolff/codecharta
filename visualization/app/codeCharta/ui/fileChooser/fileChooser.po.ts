export class FileChooserPageObject {
	async openFiles(paths: string[], clickOnFileChooser = true) {
		const [fileChooser] = await Promise.all([
			page.waitForFileChooser({ timeout: 60000 }),
			page.waitForSelector("file-chooser-directive .toolbar-button"),
			clickOnFileChooser && expect(page).toClick("file-chooser-directive .toolbar-button", { timeout: 3000 })
		])

		await fileChooser.accept(paths)

		await page.waitForSelector("#loading-gif-file")
		await page.waitForSelector("#loading-gif-file", { visible: false })
	}

	async cancelOpeningFile() {
		const [fileChooser] = await Promise.all([
			page.waitForFileChooser(),
			page.waitForSelector("file-chooser-directive .toolbar-button"),
			expect(page).toClick("file-chooser-directive .toolbar-button", { timeout: 3000 })
		])

		await fileChooser.cancel()
	}
}
