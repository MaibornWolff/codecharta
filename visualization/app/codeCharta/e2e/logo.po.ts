import { Page } from "puppeteer"

export class LogoPageObject {
	constructor(private page: Page) {}

	public async getVersion() {
		const versionString = await this.page.$eval("#mw-logo > div > h2 > span", el => el["innerText"])
		return versionString.split(" ")[1]
	}

	public async getLink() {
		return await this.page.$eval("#mw-logo > div > a", el => el["href"])
	}

	public async getImageSrc() {
		return await this.page.$eval("#mw-logo > div > a > img", el => el["src"])
	}
}
