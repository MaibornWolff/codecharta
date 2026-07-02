import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { CodeMapNode, NodeType } from "../../../../codeCharta.model"
import { IdToBuildingService } from "../../../../features/codeMap/facade"
import { rightClickedCodeMapNodeSelector } from "../../../../state/selectors/rightClickedCodeMapNode.selector"
import { setRightClickedNodeData } from "../../../../mapState/store/rightClickedNodeData/rightClickedNodeData.actions"
import { rightClickedNodeDataSelector } from "../../../../mapState/store/rightClickedNodeData/rightClickedNodeData.selector"
import { currentFocusedNodePathSelector, focusNode, unfocusAllNodes, focusedNodePathSelector } from "../../../../sharedView/sharedView.facade"
import { addBlacklistItem, addBlacklistItemsIfNotResultsInEmptyMap } from "../../../../sharedView/sharedView.facade"
import { ThreeSceneService } from "../../../../features/codeMap/facade"
import { ExplorerRevealService } from "../../../sidebarExplorer/facade"
import { currentMarkColorSelector, markFolderItemsSelector } from "../../selectors/markFolderItems.selector"
import { NodeContextMenuComponent } from "./nodeContextMenu.component"

describe("nodeContextMenu component", () => {
    const fileNode = {
        id: 1,
        name: "RatingBean.java",
        path: "/root/src/RatingBean.java",
        type: NodeType.FILE,
        attributes: {},
        isFlattened: false
    } as CodeMapNode

    const folderNode = {
        id: 2,
        name: "src",
        path: "/root/src",
        type: NodeType.FOLDER,
        attributes: {},
        isFlattened: false,
        children: [fileNode]
    } as CodeMapNode

    const threeSceneServiceMock = {
        getConstantHighlight: jest.fn(),
        addNodeAndChildrenToConstantHighlight: jest.fn(),
        removeNodeAndChildrenFromConstantHighlight: jest.fn()
    }
    const idToBuildingServiceMock = { get: jest.fn() }
    const explorerRevealServiceMock = { revealNode: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
        idToBuildingServiceMock.get.mockReturnValue(undefined)
        threeSceneServiceMock.getConstantHighlight.mockReturnValue(new Map())
    })

    type RenderMenuOptions = {
        node?: CodeMapNode | null
        origin?: "codeMap" | "explorer"
        focusedNodePath?: string
        previousFocusedNodePath?: string
    }

    async function renderMenu({ node = fileNode, origin = "codeMap", focusedNodePath, previousFocusedNodePath }: RenderMenuOptions = {}) {
        const rightClickedNodeData = node
            ? { nodeId: node.id, xPositionOfRightClickEvent: 10, yPositionOfRightClickEvent: 20, origin }
            : null
        const focusedNodePaths = [focusedNodePath, previousFocusedNodePath].filter(Boolean)
        const renderResult = await render(NodeContextMenuComponent, {
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: rightClickedNodeDataSelector, value: rightClickedNodeData },
                        { selector: rightClickedCodeMapNodeSelector, value: node },
                        { selector: currentFocusedNodePathSelector, value: focusedNodePath },
                        { selector: focusedNodePathSelector, value: focusedNodePaths },
                        { selector: markFolderItemsSelector, value: [{ color: "red", isMarked: false }] },
                        { selector: currentMarkColorSelector, value: null }
                    ]
                }),
                { provide: ThreeSceneService, useValue: threeSceneServiceMock },
                { provide: IdToBuildingService, useValue: idToBuildingServiceMock },
                { provide: ExplorerRevealService, useValue: explorerRevealServiceMock }
            ]
        })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        return { ...renderResult, store, dispatchSpy }
    }

    it("should not show the menu when no node was right-clicked", async () => {
        // Arrange & Act
        const { container } = await renderMenu({ node: null })

        // Assert
        expect(container.querySelector("#codemap-context-menu")).toBe(null)
    })

    it("should show all file actions without a color row when right-clicking a file on the map", async () => {
        // Arrange & Act
        const { container } = await renderMenu()

        // Assert
        expect(screen.getByText("…/RatingBean.java")).not.toBe(null)
        expect(screen.getByText("Show in Explorer")).not.toBe(null)
        expect(screen.getByText("Focus")).not.toBe(null)
        expect(screen.getByText("Keep Highlight")).not.toBe(null)
        expect(screen.getByText("Flatten")).not.toBe(null)
        expect(screen.getByText("Exclude")).not.toBe(null)
        expect(container.querySelector(".colorButton")).toBe(null)
    })

    it("should hide the show-in-explorer entry when the right-click came from the explorer", async () => {
        // Arrange & Act
        await renderMenu({ origin: "explorer" })

        // Assert
        expect(screen.queryByText("Show in Explorer")).toBe(null)
    })

    it("should show the color row for folders", async () => {
        // Arrange & Act
        const { container } = await renderMenu({ node: folderNode })

        // Assert
        expect(container.querySelectorAll(".colorButton").length).toBe(1)
    })

    it("should copy the node path without the root segment when clicking the header", async () => {
        // Arrange
        const writeText = jest.fn().mockResolvedValue(undefined)
        Object.assign(navigator, { clipboard: { writeText } })
        await renderMenu()

        // Act
        fireEvent.click(screen.getByTitle("Copy path to clipboard"))

        // Assert
        expect(writeText).toHaveBeenCalledWith("src/RatingBean.java")
    })

    it("should reveal the node in the explorer and close the menu when clicking show in explorer", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu()

        // Act
        fireEvent.click(screen.getByText("Show in Explorer"))

        // Assert
        expect(explorerRevealServiceMock.revealNode).toHaveBeenCalledWith("/root/src/RatingBean.java")
        expect(dispatchSpy).toHaveBeenCalledWith(setRightClickedNodeData({ value: null }))
    })

    it("should focus the node and close the menu when clicking focus", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu()

        // Act
        fireEvent.click(screen.getByText("Focus"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(focusNode({ value: "/root/src/RatingBean.java" }))
        expect(dispatchSpy).toHaveBeenCalledWith(setRightClickedNodeData({ value: null }))
    })

    it("should show unfocus instead of focus when the node is focused", async () => {
        // Arrange & Act
        await renderMenu({ focusedNodePath: fileNode.path })

        // Assert
        expect(screen.queryByText("Focus")).toBe(null)
        expect(screen.getByText("Unfocus")).not.toBe(null)
    })

    it("should offer unfocus all when a previous focus exists", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu({ focusedNodePath: fileNode.path, previousFocusedNodePath: "/root/src" })

        // Act
        fireEvent.click(screen.getByText("Unfocus All"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(unfocusAllNodes())
    })

    it("should close when pointing down outside the menu", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu()

        // Act
        fireEvent.pointerDown(document.body)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setRightClickedNodeData({ value: null }))
    })

    it("should stay open when pointing down inside the menu", async () => {
        // Arrange
        const { container, dispatchSpy } = await renderMenu()

        // Act
        fireEvent.pointerDown(container.querySelector("#codemap-context-menu"))

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalledWith(setRightClickedNodeData({ value: null }))
    })

    it("should close on wheel outside the menu", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu()

        // Act
        fireEvent.wheel(document.body)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setRightClickedNodeData({ value: null }))
    })

    it("should close on window resize", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu()

        // Act
        fireEvent(window, new Event("resize"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setRightClickedNodeData({ value: null }))
    })

    it("should flatten the node when clicking flatten", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu()

        // Act
        fireEvent.click(screen.getByText("Flatten"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(
            addBlacklistItem({ item: { path: "/root/src/RatingBean.java", type: "flatten", nodeType: NodeType.FILE } })
        )
    })

    it("should offer to show a flattened node again", async () => {
        // Arrange & Act
        await renderMenu({ node: { ...fileNode, isFlattened: true } })

        // Assert
        expect(screen.queryByText("Flatten")).toBe(null)
        expect(screen.getByText("Show")).not.toBe(null)
    })

    it("should exclude the node when clicking exclude", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu()

        // Act
        fireEvent.click(screen.getByText("Exclude"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(
            addBlacklistItemsIfNotResultsInEmptyMap({
                items: [{ path: "/root/src/RatingBean.java", type: "exclude", nodeType: NodeType.FILE }]
            })
        )
    })

    it("should offer to remove the highlight when the node is constantly highlighted", async () => {
        // Arrange
        idToBuildingServiceMock.get.mockReturnValue({ id: 1 })
        threeSceneServiceMock.getConstantHighlight.mockReturnValue(new Map([[1, {}]]))

        // Act
        await renderMenu()

        // Assert
        expect(screen.queryByText("Keep Highlight")).toBe(null)
        expect(screen.getByText("Remove Highlight")).not.toBe(null)
    })
})
