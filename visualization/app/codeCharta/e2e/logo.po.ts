export class LogoPageObject {

    constructor(private page) {}

    public async getVersion() {
        const versionString = await this.page.evaluate(() => document.querySelector('#mw-logo > div > h2 > span')["innerText"]);
        return versionString.split(" ")[1];
    }

    public async getLink() {
        return await this.page.evaluate(() => document.querySelector('#mw-logo > div > a')["href"]);
    }

    public async getImageSrc() {
        return await this.page.evaluate(() => document.querySelector('#mw-logo > div > a > img')["src"]);
    }

}