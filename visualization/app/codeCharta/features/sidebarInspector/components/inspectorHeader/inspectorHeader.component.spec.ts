import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { CodeMapNode } from "../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { selectedNodeSelector } from "../../../../state/selectors/selectedNode.selector"
import { selectedBuildingIdSelector } from "../../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.selector"
import { InspectorVisibilityService } from "../../services/inspectorVisibility.service"
import { InspectorHeaderComponent } from "./inspectorHeader.component"

const fileNode = {
    name: "invoice.ts",
    path: "/root/services/billing/invoice.ts",
    link: "https://example.com/invoice",
    attributes: { unary: 1 }
} as unknown as CodeMapNode

const folderNode = {
    name: "billing",
    path: "/root/services/billing",
    children: [{}],
    attributes: { unary: 42 },
    fileCount: { added: 2, removed: 1, changed: 3 }
} as unknown as CodeMapNode

describe("InspectorHeaderComponent", () => {
    const writeText = jest.fn().mockResolvedValue(undefined)

    beforeAll(() => {
        Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    })

    beforeEach(() => {
        writeText.mockClear()
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: selectedNodeSelector, value: fileNode },
                        { selector: selectedBuildingIdSelector, value: 1 },
                        { selector: isDeltaStateSelector, value: false }
                    ]
                })
            ]
        })
    })

    it("should display the parent path and the highlighted node name", async () => {
        // Arrange & Act
        await render(InspectorHeaderComponent)

        // Assert
        expect(screen.getByTestId("inspector-parent-path").textContent).toBe("/root/services/billing/")
        expect(screen.getByTestId("inspector-node-name").textContent).toContain("invoice.ts")
    })

    it("should render an external link when the node has one", async () => {
        // Arrange & Act
        await render(InspectorHeaderComponent)

        // Assert
        const link = screen.getByTestId("inspector-node-link")
        expect(link.getAttribute("href")).toBe("https://example.com/invoice")
        expect(link.getAttribute("rel")).toBe("noopener noreferrer")
    })

    it("should show the file count for folders", async () => {
        // Arrange
        const { detectChanges } = await render(InspectorHeaderComponent)
        const mockStore = TestBed.inject(MockStore)
        mockStore.overrideSelector(selectedNodeSelector, folderNode)
        mockStore.refreshState()

        // Act
        detectChanges()

        // Assert
        expect(screen.getByTestId("inspector-file-count").textContent).toContain("42 files")
    })

    it("should show delta file counts in delta mode", async () => {
        // Arrange
        const { detectChanges } = await render(InspectorHeaderComponent)
        const mockStore = TestBed.inject(MockStore)
        mockStore.overrideSelector(selectedNodeSelector, folderNode)
        mockStore.overrideSelector(isDeltaStateSelector, true)
        mockStore.refreshState()

        // Act
        detectChanges()

        // Assert
        const fileCount = screen.getByTestId("inspector-file-count").textContent
        expect(fileCount).toContain("Δ2")
        expect(fileCount).toContain("Δ-1")
        expect(fileCount).toContain("Δ3")
    })

    it("should hide the file count for files", async () => {
        // Arrange & Act
        await render(InspectorHeaderComponent)

        // Assert
        expect(screen.queryByTestId("inspector-file-count")).toBe(null)
    })

    it("should copy the node path to the clipboard and show feedback", async () => {
        // Arrange
        const { container } = await render(InspectorHeaderComponent)

        // Act
        await userEvent.click(screen.getByTestId("inspector-copy-path-button"))

        // Assert
        expect(writeText).toHaveBeenCalledWith("/root/services/billing/invoice.ts")
        await waitFor(() => expect(container.querySelector("[data-testid='inspector-copy-path-button'] i").className).toContain("fa-check"))
    })

    it("should close the inspector when clicking the close button", async () => {
        // Arrange
        await render(InspectorHeaderComponent)
        const visibilityService = TestBed.inject(InspectorVisibilityService)
        const closeSpy = jest.spyOn(visibilityService, "close")

        // Act
        await userEvent.click(screen.getByTestId("inspector-close-button"))

        // Assert
        expect(closeSpy).toHaveBeenCalled()
    })
})
