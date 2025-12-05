import { Page } from "@playwright/test"

export class LogoPageObject {
    constructor(private page: Page) {}

    async getVersion() {
        const versionString = await this.page.locator(".logo > #logo-version").innerText()
        return versionString.split(" ")[1]
    }

    async getLink() {
        return this.page.locator(".logo > a").getAttribute("href")
    }

    async getImageSrc() {
        return this.page.locator(".logo > a > img").getAttribute("src")
    }
}
