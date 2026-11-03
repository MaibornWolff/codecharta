import { expect, type Page, test } from "@playwright/test"
import { goto } from "../../playwright.helper"
import { NavBarFolderButtonPageObject } from "../features/navBar/components/navBarFolderButton/navBarFolderButton.po"

const TRANSPARENT = "rgba(0, 0, 0, 0)"
const FILE_WITH_REAL_NAMES = "./app/codeCharta/resources/sample_with_real_author_names.cc.json"
const FILE_WITH_CLUSTERS = "./app/codeCharta/resources/sample_with_clusters.cc.json"
const FILE_WITH_COMMIT_CHANGES = "./app/codeCharta/resources/sample_with_commit_changes.cc.json"
const FILE_WITH_CLUSTER_OFF_THE_MAP = "./app/codeCharta/resources/sample_with_cluster_off_the_map.cc.json"

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
        await expect(row(page, "Web")).toContainText("22%")
        await expect(page.getByTestId("cluster-explorer-share-label")).toHaveText("share of rloc")
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

    test("should fold only the cluster whose files have no building on the map into a group that opens on a click", async ({ page }) => {
        // Arrange
        await new NavBarFolderButtonPageObject(page).openFiles([FILE_WITH_CLUSTER_OFF_THE_MAP])
        await page.getByTestId("explorer-mode-clusters").click()
        const group = page.getByTestId("cluster-explorer-off-map-group")
        await expect(group).toContainText("Not on the map (1)")
        await expect(row(page, "Author 1")).toBeVisible()
        await expect(row(page, "Author 5")).toHaveCount(0)

        // Act
        await group.click()

        // Assert
        await expect(row(page, "Author 5")).toHaveAttribute("title", "Author 5\n1 file, none of them on the map")
        await expect(group).toHaveAttribute("aria-expanded", "true")
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

    test("should measure each author's share by lines, with nothing else to sort by", async ({ page }) => {
        // Arrange & Act
        await new NavBarFolderButtonPageObject(page).openFiles([FILE_WITH_REAL_NAMES])
        await page.getByTestId("explorer-mode-clusters").click()

        // Assert
        await expect(page.getByTestId("cluster-explorer-share-label")).toHaveText("share of lines")
        await expect(row(page, "Ann Example")).toContainText("69%")
        await expect(page.getByTestId("cluster-explorer-sort")).toHaveCount(0)
    })

    test.describe("with one cluster per commit", () => {
        test.beforeEach(async ({ page }) => {
            await new NavBarFolderButtonPageObject(page).openFiles([FILE_WITH_COMMIT_CHANGES])
            await page.getByTestId("explorer-mode-clusters").click()
        })

        test("should render only the rows on screen and bring others in on scrolling", async ({ page }) => {
            // Arrange
            const rows = page.getByTestId("cluster-explorer-row")
            await expect(rows.first()).toBeVisible()
            const firstRowBefore = await rows.first().textContent()

            // Act
            const renderedRows = await rows.count()
            await page.getByTestId("cluster-explorer-list").evaluate(list => {
                list.closest(".overflow-auto")?.scrollBy(0, 5000)
            })

            // Assert
            expect(renderedRows).toBeLessThan(100)
            await expect.poll(() => rows.first().textContent()).not.toBe(firstRowBefore)
        })

        test("should keep every rendered row the same height, which the rendering of a slice relies on", async ({ page }) => {
            // Arrange
            const rows = page.locator("[data-cluster-row]")
            await expect(rows.first()).toBeVisible()

            // Act
            const heights = await rows.evaluateAll(elements => elements.map(element => (element as HTMLElement).offsetHeight))

            // Assert
            expect(new Set(heights).size).toBe(1)
        })

        test("should show a commit's attributes and sort by them", async ({ page }) => {
            // Arrange
            const rows = page.getByTestId("cluster-explorer-row")

            // Act
            await page.getByTestId("cluster-explorer-sort").selectOption({ label: "Lines changed" })

            // Assert
            await expect(rows.first().getByTestId("cluster-explorer-attributes")).toContainText("Lines changed: 500")
            await expect(rows.first().getByTestId("cluster-explorer-attributes")).toContainText("Date: 2026-")
        })

        test("should filter the commits by name", async ({ page }) => {
            // Arrange
            const rows = page.getByTestId("cluster-explorer-row")

            // Act
            await page.getByTestId("cluster-explorer-filter").fill("number 499")

            // Assert
            await expect(rows).toHaveCount(1)
            await expect(rows).toContainText("Change number 499")

            // Act
            await page.getByTestId("cluster-explorer-filter").fill("no such commit")

            // Assert
            await expect(page.getByTestId("cluster-explorer-no-match")).toBeVisible()
        })

        test("should cap the commits listed for a file in the inspector", async ({ page }) => {
            // Arrange
            await page.getByTestId("explorer-mode-files").click()

            // Act
            await page.locator("[id$='/root/bigLeaf.ts']").click()

            // Assert
            const section = page.getByTestId("inspector-clusters").filter({ hasText: "Commit changes" })
            await expect(section.getByTestId("inspector-cluster-owner")).toHaveCount(20)
            await expect(section.getByTestId("inspector-cluster-hidden-owners")).toContainText("and 105 more")
        })
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
