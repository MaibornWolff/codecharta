export class LogoPageObject {
	public async getVersion() {
		const versionString = await page.$eval("#mw-logo > div > h2 > span", el => el["innerText"])
		return versionString.split(" ")[1]
	}

	public async getLink() {
		return await page.$eval("#mw-logo > div > a", el => el["href"])
	}

	public async getImageSrc() {
		return await page.$eval("#mw-logo > div > a > img", el => el["src"])
	}
}
