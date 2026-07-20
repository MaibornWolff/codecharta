import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { selectedBuildingIdSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { provideExplorerHostMock } from "../../explorerHost.mocks"
import { explorerTreeNodeSelector } from "../../selectors/explorerTreeNode.selector"
import { explorerCountsSelector } from "../../selectors/sidebarExplorer.selectors"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { EXPLORER_DEFAULT_WIDTH, ExplorerWidthService } from "../../services/explorerWidth.service"
import { SidebarExplorerComponent } from "./sidebarExplorer.component"

const ROOT: CodeMapNode = {
    name: "root",
    path: "/root",
    type: NodeType.FOLDER,
    attributes: { unary: 0 },
    children: []
}

describe("SidebarExplorerComponent", () => {
    const configureWithCapabilities = (capabilities?: { showRules?: boolean; showSearch?: boolean; showCounts?: boolean }) => {
        TestBed.configureTestingModule({
            imports: [SidebarExplorerComponent],
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: explorerTreeNodeSelector, value: ROOT },
                        { selector: explorerCountsSelector, value: { shown: 0, flattened: 0, hidden: 0, noArea: 0 } }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                provideExplorerHostMock(
                    capabilities ? { capabilities: { showRules: true, showSearch: true, showCounts: true, ...capabilities } } : undefined
                )
            ]
        })
    }

    beforeEach(() => {
        // The collapse and width services persist to localStorage, which jsdom keeps across tests in a file.
        localStorage.clear()
        configureWithCapabilities()
    })

    it("should compose header, search bar, sort control and tree by default", async () => {
        // Arrange & Act
        const { container } = await render(SidebarExplorerComponent)

        // Assert
        expect(container.querySelector("cc-explorer-header")).not.toBe(null)
        expect(container.querySelector("cc-explorer-search-bar")).not.toBe(null)
        expect(container.querySelector("cc-explorer-sort-control")).not.toBe(null)
        expect(container.querySelector("cc-explorer-tree")).not.toBe(null)
    })

    it("should render the rules popovers and search bar by default", async () => {
        // Arrange & Act
        const { container } = await render(SidebarExplorerComponent)

        // Assert
        expect(container.querySelectorAll("cc-rules-popover").length).toBe(2)
        expect(container.querySelector("cc-explorer-search-bar")).not.toBe(null)
    })

    it("should hide the rules popovers when the host does not want them", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithCapabilities({ showRules: false })

        // Act
        const { container } = await render(SidebarExplorerComponent)

        // Assert
        expect(container.querySelectorAll("cc-rules-popover").length).toBe(0)
        // header, sort control and tree stay on
        expect(container.querySelector("cc-explorer-header")).not.toBe(null)
        expect(container.querySelector("cc-explorer-sort-control")).not.toBe(null)
        expect(container.querySelector("cc-explorer-tree")).not.toBe(null)
    })

    it("should hide the search bar when the host does not want it", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithCapabilities({ showSearch: false })

        // Act
        const { container } = await render(SidebarExplorerComponent)

        // Assert
        expect(container.querySelector("cc-explorer-search-bar")).toBe(null)
    })

    it("should hide the count chips when the host does not want them", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithCapabilities({ showCounts: false })

        // Act
        const { container } = await render(SidebarExplorerComponent)

        // Assert
        expect(container.querySelectorAll("cc-explorer-count-chip").length).toBe(0)
        expect(container.querySelector("cc-explorer-header")).not.toBe(null)
    })

    it("should render the count chips by default", async () => {
        // Arrange & Act
        const { container } = await render(SidebarExplorerComponent)

        // Assert
        expect(container.querySelectorAll("cc-explorer-count-chip").length).toBe(3)
    })

    it("should size the expanded explorer without a file-extension bar unless one publishes its height", async () => {
        // Arrange & Act
        const { fixture } = await render(SidebarExplorerComponent)
        const host = fixture.nativeElement as HTMLElement

        // Assert — the domain view mounts no file-extension bar, so an absent bar must contribute 0px
        expect(host.style.height).toContain("var(--cc-file-extension-bar-height, 0px)")
    })

    it("should render only the expand button and the selection bar when collapsed", async () => {
        // Arrange
        const { container, detectChanges } = await render(SidebarExplorerComponent)
        const collapseService = TestBed.inject(ExplorerCollapseService)

        // Act
        collapseService.toggle()
        detectChanges()

        // Assert
        expect(screen.getByTestId("explorer-expand-button")).not.toBe(null)
        expect(container.querySelector("cc-explorer-search-bar")).toBe(null)
        expect(container.querySelector("cc-explorer-header")).toBe(null)
        expect(container.querySelector("cc-explorer-sort-control")).toBe(null)
        expect(container.querySelector("cc-explorer-tree")).toBe(null)
    })

    it("should name the selected node with a copy button while collapsed", async () => {
        // Arrange — the tree is gone, but the selection still drives the view
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [SidebarExplorerComponent],
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: explorerTreeNodeSelector, value: ROOT },
                        { selector: explorerCountsSelector, value: { shown: 0, flattened: 0, hidden: 0, noArea: 0 } },
                        { selector: selectedBuildingIdSelector, value: "/root/src/main.ts" }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                provideExplorerHostMock()
            ]
        })
        const { detectChanges } = await render(SidebarExplorerComponent)

        // Act
        TestBed.inject(ExplorerCollapseService).toggle()
        detectChanges()

        // Assert
        expect(screen.getByTestId("explorer-collapsed-path").textContent.trim()).toBe("/root/src/main.ts")
        expect(screen.getByTestId("explorer-copy-path-button")).not.toBe(null)
    })

    it("should copy the selected path to the clipboard from the collapsed bar", async () => {
        // Arrange
        TestBed.resetTestingModule()
        const writeText = jest.fn().mockResolvedValue(undefined)
        Object.assign(navigator, { clipboard: { writeText } })
        TestBed.configureTestingModule({
            imports: [SidebarExplorerComponent],
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: explorerTreeNodeSelector, value: ROOT },
                        { selector: explorerCountsSelector, value: { shown: 0, flattened: 0, hidden: 0, noArea: 0 } },
                        { selector: selectedBuildingIdSelector, value: "/root/src/main.ts" }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                provideExplorerHostMock()
            ]
        })
        const { detectChanges } = await render(SidebarExplorerComponent)
        TestBed.inject(ExplorerCollapseService).toggle()
        detectChanges()

        // Act
        await userEvent.click(screen.getByTestId("explorer-copy-path-button"))

        // Assert
        expect(writeText).toHaveBeenCalledWith("/root/src/main.ts")
    })

    it("should not clip its children while collapsed", async () => {
        // Arrange — collapsed the host is one short row, so clipping would swallow anything taller
        const { fixture, detectChanges } = await render(SidebarExplorerComponent)
        const host = fixture.nativeElement as HTMLElement

        // Act
        TestBed.inject(ExplorerCollapseService).toggle()
        detectChanges()

        // Assert
        expect(host.classList.contains("overflow-hidden")).toBe(false)
    })

    it("should apply the explorer width from the width service to the host", async () => {
        // Arrange & Act
        const { fixture } = await render(SidebarExplorerComponent)
        const host = fixture.nativeElement as HTMLElement

        // Assert
        expect(host.style.width).toBe(`${EXPLORER_DEFAULT_WIDTH}px`)
    })

    it("should resize the explorer when dragging the resize handle", async () => {
        // Arrange
        await render(SidebarExplorerComponent)
        const widthService = TestBed.inject(ExplorerWidthService)
        const handle = screen.getByTestId("explorer-resize-handle")

        // Act
        handle.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }))
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 480 }))
        window.dispatchEvent(new MouseEvent("pointerup"))

        // Assert
        expect(widthService.width()).toBe(480)
    })

    it("should stop resizing when the pointer is released anywhere, e.g. over the top bar", async () => {
        // Arrange
        await render(SidebarExplorerComponent)
        const widthService = TestBed.inject(ExplorerWidthService)
        const handle = screen.getByTestId("explorer-resize-handle")
        handle.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }))
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 480 }))

        // Act
        window.dispatchEvent(new MouseEvent("pointerup"))
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 650 }))

        // Assert
        expect(widthService.width()).toBe(480)
    })

    it("should keep the resized width while collapsed", async () => {
        // Arrange — a separate collapsed width made the bar jump size on every toggle
        const { fixture, detectChanges } = await render(SidebarExplorerComponent)
        const host = fixture.nativeElement as HTMLElement
        const widthService = TestBed.inject(ExplorerWidthService)
        const collapseService = TestBed.inject(ExplorerCollapseService)
        widthService.setWidth(600)
        detectChanges()

        // Act
        collapseService.toggle()
        detectChanges()

        // Assert
        expect(host.style.width).toBe("600px")
        expect(widthService.width()).toBe(600)
    })

    it("should restore the resized width when expanded again", async () => {
        // Arrange
        const { fixture, detectChanges } = await render(SidebarExplorerComponent)
        const host = fixture.nativeElement as HTMLElement
        const widthService = TestBed.inject(ExplorerWidthService)
        const collapseService = TestBed.inject(ExplorerCollapseService)
        widthService.setWidth(600)
        collapseService.toggle()
        detectChanges()

        // Act
        collapseService.toggle()
        detectChanges()

        // Assert
        expect(host.style.width).toBe("600px")
    })

    it("should ignore pointer movement when no resize is in progress", async () => {
        // Arrange
        await render(SidebarExplorerComponent)
        const widthService = TestBed.inject(ExplorerWidthService)

        // Act
        window.dispatchEvent(new MouseEvent("pointermove", { clientX: 480 }))

        // Assert
        expect(widthService.width()).toBe(EXPLORER_DEFAULT_WIDTH)
    })

    it("should reset the explorer width on double-click of the resize handle", async () => {
        // Arrange
        const { detectChanges } = await render(SidebarExplorerComponent)
        const widthService = TestBed.inject(ExplorerWidthService)
        widthService.setWidth(500)
        detectChanges()
        const handle = screen.getByTestId("explorer-resize-handle")

        // Act
        handle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }))
        detectChanges()

        // Assert
        expect(widthService.width()).toBe(EXPLORER_DEFAULT_WIDTH)
    })

    it("should expand back to the full layout when the expand button is clicked", async () => {
        // Arrange
        const { container, detectChanges } = await render(SidebarExplorerComponent)
        const collapseService = TestBed.inject(ExplorerCollapseService)
        collapseService.toggle()
        detectChanges()

        // Act
        await userEvent.click(screen.getByTestId("explorer-expand-button"))
        detectChanges()

        // Assert
        expect(collapseService.isCollapsed()).toBe(false)
        expect(container.querySelector("cc-explorer-header")).not.toBe(null)
        expect(container.querySelector("cc-explorer-tree")).not.toBe(null)
    })
})
