export class LogoPageObject {

    constructor(private page) {}

    async getVersion() {
        const versionString = await this.page.evaluate(() => document.querySelector('#title > div > h2 > span')["innerText"]);
        return versionString.split(" ")[1];
    }

    async getLink() {
        return await this.page.evaluate(() => document.querySelector('#title > div > a')["href"]);
    }

    async getImageSrc() {
        return await this.page.evaluate(() => document.querySelector('#title > div > a > img')["src"]);
    }

}