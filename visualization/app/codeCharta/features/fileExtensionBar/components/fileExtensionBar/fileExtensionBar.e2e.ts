import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../../playwright.helper"
import { NavBarFolderButtonPageObject } from "../../../navBar/components/navBarFolderButton/navBarFolderButton.po"

const SMALL_EXTENSIONS_MAP = "./app/codeCharta/resources/sample_with_small_extensions.cc.json"

test.describe("distribution bar others", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
        await new NavBarFolderButtonPageObject(page).openFiles([SMALL_EXTENSIONS_MAP])
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should list the extensions of others on hover and exclude a single one of them", async ({ page }) => {
        // Arrange
        const otherSegment = page.locator("cc-file-extension-bar-segment", { hasText: "other" })
        const othersList = page.locator('[data-test-id="othersList"]')
        await otherSegment.hover()
        await expect(othersList).toContainText("yml 2.00%")

        // Act
        await othersList.locator('[data-test-id="otherExtension"]', { hasText: "sh" }).click({ button: "right" })
        await page.locator('[data-test-id="excludeBuilding"]').click()
        await otherSegment.hover()

        // Assert
        await expect(othersList.locator('[data-test-id="otherExtension"]')).toHaveText([/^yml /, /^xml /])
    })
})
