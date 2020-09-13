export class LogoPageObject {
	public async getVersion() {
		await page.waitForSelector("#mw-logo > div > h2 > span")
		const versionString = await page.$eval("#mw-logo > div > h2 > span", element => element["innerText"])
		return versionString.split(" ")[1]
	}

	public async getLink() {
		await page.waitForSelector("#mw-logo > div > a")
		return page.$eval("#mw-logo > div > a", element => element["href"])
	}

	public async getImageSrc() {
		await page.waitForSelector("#mw-logo > div > a > img")
		return page.$eval("#mw-logo > div > a > img", element => element["src"])
	}
}
