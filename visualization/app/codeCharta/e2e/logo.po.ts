export class LogoPageObject {
    async getVersion() {
        await page.waitForSelector(".logo > #logo-version")
        const versionString = await page.$eval(".logo > #logo-version", element => element["innerText"])
        return versionString.split(" ")[1]
    }

    async getLink() {
        await page.waitForSelector(".logo > a")
        return page.$eval(".logo > a", element => element["href"])
    }

    async getImageSrc() {
        await page.waitForSelector(".logo > a > img")
        return page.$eval(".logo > a > img", element => element["src"])
    }
}
