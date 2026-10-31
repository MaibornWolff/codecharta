import { expect, type Page, test } from "@playwright/test"
import { goto } from "../../playwright.helper"
import { NavBarFolderButtonPageObject } from "../features/navBar/components/navBarFolderButton/navBarFolderButton.po"

const TRANSPARENT = "rgba(0, 0, 0, 0)"
const FILE_WITH_REAL_NAMES = "./app/codeCharta/resources/sample_with_real_author_names.cc.json"
const FILE_WITH_CLUSTERS = "./app/codeCharta/resources/sample_with_clusters.cc.json"

async function openClustersTab(page: Page) {
    await new NavBarFolderButtonPageObject(page).openFiles([FILE_WITH_CLUSTERS])
    await page.getByTestId("explorer-mode-clusters").click()
}

const row = (page: Page, name: string) => page.getByTestId("cluster-explorer-row").filter({ hasText: name })

// The map's middle, clear of the explorer, whose rows change on hover themselves.
const MAP_AREA = { x: 700, y: 200, width: 800, height: 400 }

async function mapPixels(page: Page) {
    return page.screenshot({ clip: MAP_AREA })
}

test.describe("Cluster explorer", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test("should offer the tab only for a file with clusters", async ({ page }) => {
        // Arrange & Act
        const tabBeforeLoading = await page.getByTestId("explorer-mode-clusters").count()
        await new NavBarFolderButtonPageObject(page).openFiles([FILE_WITH_CLUSTERS])

        // Assert
        expect(tabBeforeLoading).toBe(0)
        await expect(page.getByTestId("explorer-mode-clusters")).toBeVisible()
    })

    test("should list the shares of files and switch clusterings by title", async ({ page }) => {
        // Arrange & Act
        await openClustersTab(page)

        // Assert
        await expect(row(page, "Author 1")).toContainText("44%")
        await expect(row(page, "Author 3")).toContainText("19%")
        await expect(page.getByTestId("cluster-explorer-not-attributed")).toContainText("38%")

        // Act
        await page.getByTestId("cluster-explorer-picker").selectOption({ label: "Teams" })

        // Assert
        await expect(row(page, "Web")).toContainText("50%")
        await expect(page.getByTestId("cluster-explorer-not-attributed")).toHaveCount(0)
    })

    test("should light the files on hover and keep them lit once pinned", async ({ page }) => {
        // Arrange
        await openClustersTab(page)
        const unlit = await mapPixels(page)

        // Act
        await row(page, "Author 1").hover()

        // Assert
        await expect.poll(async () => (await mapPixels(page)).equals(unlit)).toBe(false)

        // Act
        await page.getByText("share of files").hover()

        // Assert
        await expect.poll(async () => (await mapPixels(page)).equals(unlit)).toBe(true)

        // Act
        await row(page, "Author 1").click()
        await page.getByText("share of files").hover()

        // Assert
        await expect(row(page, "Author 1")).toHaveAttribute("aria-pressed", "true")
        await expect.poll(async () => (await mapPixels(page)).equals(unlit)).toBe(false)

        // Act
        await row(page, "Author 1").click()

        // Assert
        await expect(row(page, "Author 1")).toHaveAttribute("aria-pressed", "false")
    })

    test("should label only the files of the cluster while it is hovered or pinned", async ({ page }) => {
        // Arrange
        await openClustersTab(page)
        const labelOutsideCluster = page.locator("cc-code-map").getByText("sample1OnlyLeaf.scss")
        await expect(labelOutsideCluster).toBeVisible()

        // Act
        await row(page, "Author 3").hover()

        // Assert
        await expect(labelOutsideCluster).toHaveCount(0)
        await expect(page.locator("cc-code-map").getByText("smallLeaf.html")).toBeVisible()

        // Act
        await page.getByText("share of files").hover()

        // Assert
        await expect(labelOutsideCluster).toBeVisible()

        // Act
        await row(page, "Author 3").click()
        await page.getByText("share of files").hover()

        // Assert
        await expect(labelOutsideCluster).toHaveCount(0)
    })

    test("should show only the hovered cluster while another one stays pinned", async ({ page }) => {
        // Arrange
        await openClustersTab(page)
        const labelOfPinnedOnly = page.locator("cc-code-map").getByText("bigLeaf.ts")
        await row(page, "Author 1").click()
        await page.getByText("share of files").hover()
        await expect(labelOfPinnedOnly).toBeVisible()

        // Act
        await row(page, "Author 3").hover()

        // Assert
        await expect(labelOfPinnedOnly).toHaveCount(0)
        await expect(row(page, "Author 1")).toHaveAttribute("aria-pressed", "true")

        // Act
        await page.getByText("share of files").hover()

        // Assert
        await expect(labelOfPinnedOnly).toBeVisible()
    })

    test("should warn when a map shows real author names, and only then", async ({ page }) => {
        // Arrange & Act
        await openClustersTab(page)

        // Assert
        await expect(page.getByTestId("cluster-explorer-real-names")).toHaveCount(0)

        // Act
        await new NavBarFolderButtonPageObject(page).openFiles([FILE_WITH_REAL_NAMES])
        await page.getByTestId("explorer-mode-clusters").click()

        // Assert
        await expect(page.getByTestId("cluster-explorer-real-names")).toContainText("real author names")
        await expect(row(page, "Ann Example")).toBeVisible()
    })

    test("should mark only the pinned row with a primary border", async ({ page }) => {
        // Arrange
        await openClustersTab(page)

        // Act
        await row(page, "Author 1").click()

        // Assert
        await expect(row(page, "Author 1")).not.toHaveCSS("border-top-color", TRANSPARENT)
        await expect(row(page, "Author 3")).toHaveCSS("border-top-color", TRANSPARENT)
    })

    test("should show the owners of the selected file in the inspector", async ({ page }) => {
        // Arrange
        await new NavBarFolderButtonPageObject(page).openFiles([FILE_WITH_CLUSTERS])
        await page.locator("[id$='/root/bigLeaf.ts']").click()

        // Assert
        const section = page.getByTestId("inspector-clusters").filter({ hasText: "Author ownership" })
        await expect(section.getByTestId("inspector-cluster-owner")).toContainText("Author 1")
        await expect(section.getByTestId("inspector-cluster-owner")).toContainText("100%")
        await expect(section.getByTestId("inspector-cluster-not-attributed")).toHaveCount(0)
    })
})
