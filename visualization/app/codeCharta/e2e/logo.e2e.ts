import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "../../playwright.helper"
import { LogoPageObject } from "./logo.po"
import packageJson from "../../../package.json"

test.describe("CodeCharta logo", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should have correct version", async ({ page }) => {
        const logo = new LogoPageObject(page)
        expect(await logo.getVersion()).toBe(packageJson.version)
    })

    test("should have correct link", async ({ page }) => {
        const logo = new LogoPageObject(page)
        expect(await logo.getLink()).toBe("https://github.com/MaibornWolff/codecharta")
    })

    test("should have correct image as logo", async ({ page }) => {
        const logo = new LogoPageObject(page)
        const source = await logo.getImageSrc()
        expect(source).toContain("codeCharta/assets/codecharta_logo.svg")
    })
})
