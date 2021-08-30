export class DialogChangelogPageObject {
	async doSomething() {
		await page.waitForSelector("CSS_SELECTOR")
		return page.$eval("A > CSS_SELECTOR", element => element["someAttribute"])
	}
}
