export class FileChooserPageObject {
	public async openFile(path: string) {
		const [fileChooser] = await Promise.all([
			page.waitForFileChooser(),
			expect(page).toClick("file-chooser-directive .toolbar-button", { timeout: 3000 })
		])

		await fileChooser.accept([path])

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
