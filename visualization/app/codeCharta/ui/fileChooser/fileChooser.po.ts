export class FileChooserPageObject {
	async openFiles(paths: string[], clickOnFileChooser = true) {
		const [fileChooser] = await Promise.all([
			page.waitForFileChooser(),
			clickOnFileChooser && expect(page).toClick("file-chooser-directive .toolbar-button", { timeout: 3000 })
		])

		await fileChooser.accept(paths)

		await page.waitForSelector("#loading-gif-file")
		await page.waitForSelector("#loading-gif-file", { visible: false })
	}

	async cancelOpeningFile() {
		const [fileChooser] = await Promise.all([
			page.waitForFileChooser(),
			expect(page).toClick("file-chooser-directive .toolbar-button", { timeout: 3000 })
		])

		await fileChooser.cancel()
	}
}
