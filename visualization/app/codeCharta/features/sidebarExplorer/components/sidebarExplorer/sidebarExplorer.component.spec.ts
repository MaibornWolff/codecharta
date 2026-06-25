import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { CodeMapNode, NodeType } from "../../../../codeCharta.model"
import { IdToBuildingService } from "../../../../features/codeMap/facade"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapMouseEventService } from "../../../../features/codeMap/facade"
import { ThreeRendererService } from "../../../../features/codeMap/facade"
import { ThreeSceneService } from "../../../../features/codeMap/facade"
import { explorerTreeNodeSelector } from "../../selectors/explorerTreeNode.selector"
import { explorerCountsSelector } from "../../selectors/sidebarExplorer.selectors"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { EXPLORER_COLLAPSED_WIDTH, EXPLORER_DEFAULT_WIDTH, ExplorerWidthService } from "../../services/explorerWidth.service"
import { SidebarExplorerComponent } from "./sidebarExplorer.component"

const ROOT: CodeMapNode = {
    name: "root",
    path: "/root",
    type: NodeType.FOLDER,
    attributes: { unary: 0 },
    children: []
}

describe("SidebarExplorerComponent", () => {
    beforeEach(() => {
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
                { provide: ThreeSceneService, useValue: { selectBuilding: jest.fn(), clearConstantHighlight: jest.fn() } },
                { provide: IdToBuildingService, useValue: { get: jest.fn(), has: jest.fn(), buildingIds$: of(new Set<number>()) } },
                { provide: ThreeRendererService, useValue: { render: jest.fn() } },
                {
                    provide: CodeMapMouseEventService,
                    useValue: { drawLabelSelectedBuilding: jest.fn(), hoverNode: jest.fn(), unhoverNode: jest.fn() }
                }
            ]
        })
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

    it("should render only the expand button and search bar when collapsed", async () => {
        // Arrange
        const { container, detectChanges } = await render(SidebarExplorerComponent)
        const collapseService = TestBed.inject(ExplorerCollapseService)

        // Act
        collapseService.toggle()
        detectChanges()

        // Assert
        expect(container.querySelector("cc-explorer-search-bar")).not.toBe(null)
        expect(screen.getByTestId("explorer-expand-button")).not.toBe(null)
        expect(container.querySelector("cc-explorer-header")).toBe(null)
        expect(container.querySelector("cc-explorer-sort-control")).toBe(null)
        expect(container.querySelector("cc-explorer-tree")).toBe(null)
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

    it("should use the collapsed width while collapsed and keep the resized width for expansion", async () => {
        // Arrange
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
        expect(host.style.width).toBe(`${EXPLORER_COLLAPSED_WIDTH}px`)
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
