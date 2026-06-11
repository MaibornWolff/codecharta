import { render, screen } from "@testing-library/angular"
import { InspectorNodeBadgesComponent } from "./inspectorNodeBadges.component"

const fileCount = { all: 42, added: 2, removed: 1, changed: 3 }

describe("InspectorNodeBadgesComponent", () => {
    it("should show a file badge without a file count", async () => {
        // Arrange & Act
        await render(InspectorNodeBadgesComponent, { inputs: { isFolder: false, isDeltaState: false } })

        // Assert
        expect(screen.getByTestId("inspector-node-type").textContent).toContain("file")
        expect(screen.queryByTestId("inspector-file-count")).toBe(null)
    })

    it("should show a folder badge with the file count", async () => {
        // Arrange & Act
        await render(InspectorNodeBadgesComponent, { inputs: { isFolder: true, fileCount, isDeltaState: false } })

        // Assert
        expect(screen.getByTestId("inspector-node-type").textContent).toContain("folder")
        expect(screen.getByTestId("inspector-file-count").textContent).toContain("42 files")
    })

    it("should show delta file counts in delta mode", async () => {
        // Arrange & Act
        const { container } = await render(InspectorNodeBadgesComponent, { inputs: { isFolder: true, fileCount, isDeltaState: true } })

        // Assert
        const badges = (container as HTMLElement).textContent
        expect(badges).toContain("Δ2")
        expect(badges).toContain("Δ-1")
        expect(badges).toContain("Δ3")
    })
})
