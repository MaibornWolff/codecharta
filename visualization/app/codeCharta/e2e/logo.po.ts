export class LogoPageObject {
	async getVersion() {
		await page.waitForSelector("#logos > h2 > span")
		const versionString = await page.$eval("#logos > h2 > span", element => element["innerText"])
		return versionString.split(" ")[2]
	}

	async getLink() {
		await page.waitForSelector("#logos > .logos-wrapper > #mw-logo")
		return page.$eval("#logos > .logos-wrapper >  #mw-logo", element => element["href"])
	}

	async getImageSrc() {
		await page.waitForSelector("#mw-logo > img")
		return page.$eval("#mw-logo > img", element => element["src"])
	}
}
