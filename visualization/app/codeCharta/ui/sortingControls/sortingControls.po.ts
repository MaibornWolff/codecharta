import { Page } from "puppeteer"

export class SortingControlsPageObject {
	constructor(private page: Page) {}

	public async doSomething() {
		return await this.page.$eval("A > CSS_SELECTOR", el => el["someAttribute"])
	}
}
