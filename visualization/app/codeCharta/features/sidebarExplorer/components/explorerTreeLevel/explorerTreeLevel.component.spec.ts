import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { firstValueFrom } from "rxjs"
import * as SearchedNodePathsSelector from "../../../../renderer/renderModel/searchedNodes/searchedNodePaths.selector"
import { appReducers, setStateMiddleware } from "../../../../stores/rootStore/store"
import { setHoveredNodeId, setRightClickedNodeData } from "../../../../stores/sharedView/sharedView.write.facade"
import { defaultRightClickedNodeData } from "../../../../stores/sharedView/store/rightClickedNodeData/rightClickedNodeData.reducer"
import * as RightClickedNodeDataSelector from "../../../../stores/sharedView/store/rightClickedNodeData/rightClickedNodeData.selector"
import { selectedBuildingIdSelector } from "../../../../stores/sharedView/store/selectedBuildingId/selectedBuildingId.selector"
import { EXPLORER_HOST, ExplorerHost } from "../../explorerHost"
import { createExplorerHostMock } from "../../explorerHost.mocks"
import { ExplorerRevealService } from "../../services/explorerReveal.service"
import { ExplorerTreeLevelComponent } from "./explorerTreeLevel.component"
import { rootNode } from "./mocks"

describe("ExplorerTreeLevelComponent", () => {
    const componentInputs = {
        depth: 0,
        node: rootNode
    }

    const rootNodePath = componentInputs.node.path
    const parentLeafPath = componentInputs.node.children.find(childNode => childNode.name === "ParentLeaf").path

    let host: ExplorerHost

    const configureWithHost = (overrides: Partial<ExplorerHost> = {}) => {
        host = createExplorerHostMock(overrides)
        TestBed.configureTestingModule({
            imports: [ExplorerTreeLevelComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: [{ provide: EXPLORER_HOST, useValue: host }]
        })
    }

    beforeEach(() => {
        localStorage.clear()
        configureWithHost()
        jest.spyOn(SearchedNodePathsSelector, "searchedNodePathsSelector").mockReturnValue(new Set<string>())
        jest.spyOn(RightClickedNodeDataSelector, "rightClickedNodeDataSelector").mockReturnValue(defaultRightClickedNodeData)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it("should show root and first level folder and files initially", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

        // Assert
        expect(container.getElementsByClassName("tree-element-0").length).toBe(1)
        expect(screen.getByText("root")).toBeTruthy()
        expect(container.getElementsByClassName("tree-element-1").length).toBe(2)
        expect(screen.getByText("bigLeaf")).toBeTruthy()
        expect(screen.getByText("ParentLeaf")).toBeTruthy()
    })

    it("should render first level folder closed initially and open it on click", async () => {
        // Arrange
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")
        expect(container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")).toBeFalsy()

        // Act
        await userEvent.click(firstLevelFolder)

        // Assert
        await waitFor(() => expect(container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")).toBeTruthy())
    })

    it("should mark search-result rows", async () => {
        // Arrange
        jest.spyOn(SearchedNodePathsSelector, "searchedNodePathsSelector").mockReturnValue(new Set(["/root/bigLeaf"]))

        // Act
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

        // Assert
        await waitFor(() => {
            const span = container.querySelector("#\\/root\\/bigLeaf .node-name")
            expect(span?.classList.contains("text-primary")).toBe(true)
        })
    })

    it("should set selectedBuildingId to the node path on click and tell the host", async () => {
        // Arrange — the path selection is what drives consumers such as the domain word cloud
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const store = TestBed.inject(Store)
        const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

        // Act
        await userEvent.click(firstLevelFolder)

        // Assert
        expect(await firstValueFrom(store.select(selectedBuildingIdSelector))).toBe(parentLeafPath)
        expect(host.onSelect).toHaveBeenCalledWith(expect.objectContaining({ path: parentLeafPath }))
    })

    it("should clear selection and tell the host when an open folder is clicked closed", async () => {
        // Arrange
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const store = TestBed.inject(Store)
        const rootRow = container.querySelector("#\\/root")

        // Act
        await userEvent.click(rootRow)

        // Assert
        await waitFor(() => expect(host.onDeselect).toHaveBeenCalledTimes(1))
        expect(host.onSelect).not.toHaveBeenCalled()
        expect(await firstValueFrom(store.select(selectedBuildingIdSelector))).toBeNull()
    })

    it("should ignore clicks on rows the host declares unselectable", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithHost({ isSelectable: () => false })
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const store = TestBed.inject(Store)

        // Act
        await userEvent.click(container.querySelector("#\\/root\\/bigLeaf"))

        // Assert
        expect(host.onSelect).not.toHaveBeenCalled()
        expect(await firstValueFrom(store.select(selectedBuildingIdSelector))).toBeNull()
    })

    it("should clear right-clicked node data when the explorer scroll container is scrolled", async () => {
        // Arrange
        const scrollContainer = document.createElement("div")
        scrollContainer.id = "explorer-scroll"
        document.body.append(scrollContainer)

        const { fixture } = await render(ExplorerTreeLevelComponent, {
            inputs: componentInputs,
            excludeComponentDeclaration: true
        })
        const store = TestBed.inject(Store)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const contextMenuEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            clientX: 10,
            clientY: 20
        } as unknown as MouseEvent

        // Act
        fixture.componentInstance.openNodeContextMenu(contextMenuEvent)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(
            setRightClickedNodeData({
                value: { nodeId: rootNodePath, xPositionOfRightClickEvent: 10, yPositionOfRightClickEvent: 20, origin: "explorer" }
            })
        )

        // Act
        scrollContainer.dispatchEvent(new Event("scroll"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setRightClickedNodeData({ value: null }))

        // Cleanup
        scrollContainer.remove()
    })

    it("should not open a context menu when the host has none, leaving the event untouched", async () => {
        // Arrange — the domain view has no context menu, so a right-click must mark nothing
        TestBed.resetTestingModule()
        configureWithHost({ hasContextMenu: () => false })
        const { fixture } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
        const contextMenuEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            clientX: 10,
            clientY: 20
        } as unknown as MouseEvent

        // Act
        fixture.componentInstance.openNodeContextMenu(contextMenuEvent)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: setRightClickedNodeData.type }))
        expect(contextMenuEvent.preventDefault).not.toHaveBeenCalled()
    })

    it("should publish the hovered node and tell the host on hover and unhover", async () => {
        // Arrange
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
        const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

        // Act
        await userEvent.hover(firstLevelFolder)

        // Assert
        await waitFor(() => {
            expect(dispatchSpy).toHaveBeenCalledWith(setHoveredNodeId({ value: parentLeafPath }))
            expect(host.onHover).toHaveBeenCalledWith(expect.objectContaining({ name: "ParentLeaf" }), expect.any(Object))
        })

        // Act
        await userEvent.unhover(firstLevelFolder)

        // Assert
        await waitFor(() => {
            expect(dispatchSpy).toHaveBeenCalledWith(setHoveredNodeId({ value: null }))
            expect(host.onHoverEnd).toHaveBeenCalled()
        })
    })

    it("should render the trailing decoration the host supplies", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithHost({ rowDecoration: node => (node.name === "root" ? "42% / 2" : null) })

        // Act
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

        // Assert
        expect(container.querySelector("#\\/root").textContent).toContain("42% / 2")
        expect(container.querySelector("#\\/root\\/bigLeaf").textContent).not.toContain("42% / 2")
    })

    it("should dim and italicise a row the host reports as such", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithHost({ rowState: () => ({ isDimmed: true, isItalic: true, title: "No Node Area for Chosen Metric" }) })

        // Act
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

        // Assert
        const row = container.querySelector("#\\/root")
        expect(row.getAttribute("title")).toBe("No Node Area for Chosen Metric")
        expect(row.querySelector(".node-name").classList.contains("opacity-50")).toBe(true)
        expect(row.querySelector(".node-name").classList.contains("italic")).toBe(true)
    })

    describe("reveal from show-in-explorer", () => {
        beforeEach(() => {
            Element.prototype.scrollIntoView = jest.fn()
        })

        it("should open the ancestor levels of a revealed node", async () => {
            // Arrange
            const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
            expect(container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")).toBeFalsy()

            // Act
            TestBed.inject(ExplorerRevealService).revealNode("/root/ParentLeaf/smallLeaf")

            // Assert
            await waitFor(() => expect(container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")).toBeTruthy())
        })

        it("should not open a folder whose path is only a prefix of the revealed path", async () => {
            // Arrange
            const { container, detectChanges } = await render(ExplorerTreeLevelComponent, {
                inputs: componentInputs,
                excludeComponentDeclaration: true
            })

            // Act
            TestBed.inject(ExplorerRevealService).revealNode("/root/ParentLeafSibling/file")
            detectChanges()

            // Assert
            expect(container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")).toBeFalsy()
        })

        it("should flash the revealed row", async () => {
            // Arrange
            const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

            // Act
            TestBed.inject(ExplorerRevealService).revealNode("/root/bigLeaf")

            // Assert
            await waitFor(() => expect(container.querySelector("#\\/root\\/bigLeaf").classList.contains("bg-primary/20")).toBe(true))
        })

        it("should scroll a deeply revealed row into view once its ancestors have rendered it", async () => {
            // Arrange — the row does not exist in the frame the reveal is requested
            await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

            // Act
            TestBed.inject(ExplorerRevealService).revealNode("/root/ParentLeaf/smallLeaf")

            // Assert
            await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: "center" }))
        })
    })
})
