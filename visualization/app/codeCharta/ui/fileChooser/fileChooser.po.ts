export class FileChooserPageObject {
	public async openFile(paths: string[], toOpenFileChooser = true) {
		let fileChooser

		if (toOpenFileChooser) {
			;[fileChooser] = await Promise.all([
				page.waitForFileChooser(),
				expect(page).toClick("file-chooser-directive .toolbar-button", { timeout: 3000 })
			])
		} else {
			fileChooser = await page.waitForFileChooser()
		}

		await fileChooser.accept(paths)

		await page.waitForSelector("#loading-gif-file")
		await page.waitForSelector("#loading-gif-file", { visible: false })
	}

	public async cancelOpeningFile() {
		const [fileChooser] = await Promise.all([
			page.waitForFileChooser(),
			expect(page).toClick("file-chooser-directive .toolbar-button", { timeout: 3000 })
		])

		await fileChooser.cancel()
	}
}
