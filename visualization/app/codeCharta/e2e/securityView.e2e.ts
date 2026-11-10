import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../playwright.helper"
import { NavBarFolderButtonPageObject } from "../features/navBar/components/navBarFolderButton/navBarFolderButton.po"
import { SecurityPagePageObject } from "../features/security/components/securityPage/securityPage.po"

const FILE_WITH_SECURITY = "./app/codeCharta/resources/sample_with_security.cc.json"
const FILE_WITHOUT_SECURITY = "./app/codeCharta/resources/sample_with_clusters.cc.json"

test.describe("Security view", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should offer the view only for a map with a security lens", async ({ page }) => {
        // Arrange & Act
        await new NavBarFolderButtonPageObject(page).openFiles([FILE_WITHOUT_SECURITY])
        const tabWithoutLens = await page.getByTestId("view-switcher-security").count()
        await new NavBarFolderButtonPageObject(page).openFiles([FILE_WITH_SECURITY])

        // Assert
        expect(tabWithoutLens).toBe(0)
        await expect(page.getByTestId("view-switcher-security")).toBeVisible()
    })

    test("should list the packages, the vulnerable one first, and show a file that uses it on the map", async ({ page }) => {
        // Arrange
        const security = new SecurityPagePageObject(page)
        await new NavBarFolderButtonPageObject(page).openFiles([FILE_WITH_SECURITY])
        await security.open()

        // Act
        await security.row("qs").click()

        // Assert
        await expect(security.rows()).toHaveCount(4)
        await expect(security.rows().first()).toContainText("high")
        await expect(page.getByTestId("security-summary")).toContainText("versions looked up on 2026-11-09")
        await expect(page.getByTestId("security-package-details")).toContainText("CVE-2022-24999")

        // Act
        await page.getByTestId("security-package-files").getByRole("button", { name: "src/server/routes.ts" }).click()

        // Assert
        await expect(page).toHaveURL(/#\/(\?|$)/)
    })
})
