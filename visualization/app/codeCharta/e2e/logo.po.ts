export class LogoPageObject {
	public async getVersion() {
		await page.waitForSelector("#mw-logo > div > h2 > span")
		const versionString = await page.$eval("#mw-logo > div > h2 > span", el => el["innerText"])
		return versionString.split(" ")[1]
	}

	public async getLink() {
		await page.waitForSelector("#mw-logo > div > a")
		return await page.$eval("#mw-logo > div > a", el => el["href"])
	}

	public async getImageSrc() {
		await page.waitForSelector("#mw-logo > div > a > img")
		return await page.$eval("#mw-logo > div > a > img", el => el["src"])
	}
}
