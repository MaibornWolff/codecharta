export class DialogErrorPageObject {
	constructor(private page) {}

	public async getMessage() {
		return await this.page.evaluate(() => document.querySelector(".md-dialog-content-body p")["innerText"])
	}

	public async clickOk() {
		const selector = "md-dialog-actions button"
		return this.page.click(selector)
	}
}
