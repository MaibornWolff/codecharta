export class FileChooserPageObject {
	public async openFile(path: string) {
		const [fileChooser] = await Promise.all([page.waitForFileChooser(), expect(page).toClick("file-chooser-directive .toolbar-button")])

		await fileChooser.accept([path])
		await page.waitFor(200)
	}

	public async cancelOpeningFile() {
		const [fileChooser] = await Promise.all([page.waitForFileChooser(), expect(page).toClick("file-chooser-directive .toolbar-button")])

		await fileChooser.cancel()
		await page.waitFor(200)
	}
}
