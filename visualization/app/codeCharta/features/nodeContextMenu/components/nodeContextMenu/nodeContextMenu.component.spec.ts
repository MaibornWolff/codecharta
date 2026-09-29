import { TestBed } from "@angular/core/testing"
import { provideRouter, Router } from "@angular/router"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { pathsWithDependencyLevelsSelector } from "../../../../lenses/dependency/dependencyLens.facade"
import { hasDomainDataSelector } from "../../../../lenses/domain/domainLens.facade"
import { provideMockState } from "../../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
import { flattenPredicateSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { rightClickedCodeMapNodeSelector } from "../../../../renderer/renderModel/rightClickedCodeMapNode.selector"
import { routeLinks } from "../../../../routing/routePaths"
import { ViewHandoffStore } from "../../../../routing/viewHandoff.store"
import { isRadialLayoutSelector } from "../../../../stores/mapState/mapState.read.facade"
import {
    currentFocusedNodePathSelector,
    focusedNodePathSelector,
    keptHighlightPathsSelector
} from "../../../../stores/sharedView/sharedView.read.facade"
import {
    addExcludedNodesIfNotResultsInEmptyMap,
    addFlattenedNodes,
    focusNode,
    keepHighlight,
    removeKeptHighlight,
    setRightClickedNodeData,
    unfocusAllNodes
} from "../../../../stores/sharedView/sharedView.write.facade"
import { rightClickedNodeDataSelector } from "../../../../stores/sharedView/store/rightClickedNodeData/rightClickedNodeData.selector"
import { ExplorerRevealService } from "../../../sidebarExplorer/facade"
import {
    DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES,
    NODE_CONTEXT_MENU_CAPABILITIES,
    NodeContextMenuCapabilities
} from "../../nodeContextMenuCapabilities"
import { NODE_CONTEXT_MENU_VIEW_ACTIONS, NodeContextMenuViewAction } from "../../nodeContextMenuViewActions"
import { currentMarkColorSelector, markFolderItemsSelector } from "../../selectors/markFolderItems.selector"
import { NodeContextMenuComponent } from "./nodeContextMenu.component"

describe("nodeContextMenu component", () => {
    const fileNode = {
        id: 1,
        name: "RatingBean.java",
        path: "/root/src/RatingBean.java",
        type: NodeType.FILE,
        attributes: {}
    } as CodeMapNode

    const folderNode = {
        id: 2,
        name: "src",
        path: "/root/src",
        type: NodeType.FOLDER,
        attributes: {},
        children: [fileNode]
    } as CodeMapNode

    const explorerRevealServiceMock = { revealNode: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    type RenderMenuOptions = {
        node?: CodeMapNode | null
        origin?: "codeMap" | "explorer" | "radialMap" | "dependencyMap"
        hasExplorer?: boolean
        viewActions?: NodeContextMenuViewAction[]
        focusedNodePath?: string
        previousFocusedNodePath?: string
        capabilities?: NodeContextMenuCapabilities
        hasDomainData?: boolean
        pathsWithDependencyLevels?: ReadonlySet<string>
        isFlattened?: (node: CodeMapNode) => boolean
        isRadialLayout?: boolean
        keptHighlightPaths?: string[]
    }

    async function renderMenu({
        node = fileNode,
        origin = "codeMap",
        focusedNodePath,
        previousFocusedNodePath,
        capabilities = DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES,
        hasDomainData = true,
        pathsWithDependencyLevels = new Set<string>(),
        isFlattened = () => false,
        isRadialLayout = false,
        keptHighlightPaths = [],
        hasExplorer = true,
        viewActions
    }: RenderMenuOptions = {}) {
        const rightClickedNodeData = node
            ? { nodeId: node.id, xPositionOfRightClickEvent: 10, yPositionOfRightClickEvent: 20, origin }
            : null
        const focusedNodePaths = [focusedNodePath, previousFocusedNodePath].filter(Boolean)
        const renderResult = await render(NodeContextMenuComponent, {
            providers: [
                provideRouter([]),
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: flattenPredicateSelector, value: isFlattened },
                        { selector: rightClickedNodeDataSelector, value: rightClickedNodeData },
                        { selector: rightClickedCodeMapNodeSelector, value: node },
                        { selector: currentFocusedNodePathSelector, value: focusedNodePath },
                        { selector: focusedNodePathSelector, value: focusedNodePaths },
                        { selector: markFolderItemsSelector, value: [{ color: "red", isMarked: false }] },
                        { selector: currentMarkColorSelector, value: null },
                        { selector: hasDomainDataSelector, value: hasDomainData },
                        { selector: pathsWithDependencyLevelsSelector, value: pathsWithDependencyLevels },
                        { selector: isRadialLayoutSelector, value: isRadialLayout },
                        { selector: keptHighlightPathsSelector, value: keptHighlightPaths }
                    ]
                }),
                ...(hasExplorer ? [{ provide: ExplorerRevealService, useValue: explorerRevealServiceMock }] : []),
                ...(viewActions ? [{ provide: NODE_CONTEXT_MENU_VIEW_ACTIONS, useValue: viewActions }] : []),
                { provide: NODE_CONTEXT_MENU_CAPABILITIES, useValue: capabilities }
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
        expect(screen.getByText("Flatten & decolor")).not.toBe(null)
        expect(screen.getByText("Exclude")).not.toBe(null)
        expect(container.querySelector(".colorButton")).toBe(null)
    })

    it.each([
        "radialMap",
        "explorer"
    ] as const)("should offer the highlight and folder marking in the sunburst for a right-click from the %s", async origin => {
        // Arrange & Act
        await renderMenu({ node: folderNode, origin, isRadialLayout: true })

        // Assert
        expect(screen.getByText("Focus")).not.toBe(null)
        expect(screen.getByText("Keep Highlight")).not.toBe(null)
        expect(screen.getByText("Flatten & decolor")).not.toBe(null)
        expect(screen.getByText("Exclude")).not.toBe(null)
        expect(document.querySelector("cc-mark-folder-row")).not.toBe(null)
    })

    it("should not offer to focus a file while the sunburst is shown, which cannot centre on one", async () => {
        // Arrange & Act
        await renderMenu({ node: fileNode, origin: "radialMap", isRadialLayout: true })

        // Assert
        expect(screen.queryByText("Focus")).toBe(null)
        expect(screen.getByText("Exclude")).not.toBe(null)
    })

    it("should set the highlight apart from the path and from Flatten for a file in the sunburst", async () => {
        // Arrange & Act
        const { container } = await renderMenu({ node: fileNode, origin: "radialMap", isRadialLayout: true })

        // Assert
        expect(container.querySelectorAll(".border-t")).toHaveLength(2)
    })

    it("should set the view actions, Flatten and the folder marking apart for a folder in the sunburst", async () => {
        // Arrange & Act
        const { container } = await renderMenu({ node: folderNode, origin: "radialMap", isRadialLayout: true })

        // Assert
        expect(container.querySelectorAll(".border-t")).toHaveLength(3)
    })

    it("should offer Show in Explorer for a right-click in the sunburst", async () => {
        // Arrange & Act
        await renderMenu({ origin: "radialMap", isRadialLayout: true })

        // Assert
        expect(screen.getByText("Show in Explorer")).not.toBe(null)
    })

    it("should offer the actions the view adds and run them on the node", async () => {
        // Arrange
        const run = jest.fn()
        const { dispatchSpy } = await renderMenu({ viewActions: [{ label: "Hide", icon: "fa-regular fa-eye-slash", hoverHint: "", run }] })

        // Act
        fireEvent.click(screen.getByText("Hide"))

        // Assert
        expect(run).toHaveBeenCalledWith(fileNode.path)
        expect(dispatchSpy).toHaveBeenCalledWith(setRightClickedNodeData({ value: null }))
    })

    it("should offer a view's action only for the nodes it applies to", async () => {
        // Arrange
        const run = jest.fn()
        const viewActions = [
            { label: "Hide", icon: "fa-regular fa-eye-slash", hoverHint: "", run, isOfferedFor: () => false },
            { label: "Show again", icon: "fa-regular fa-eye", hoverHint: "", run, isOfferedFor: (path: string) => path === fileNode.path }
        ]

        // Act
        await renderMenu({ viewActions })

        // Assert
        expect(screen.queryByText("Hide")).toBeNull()
        expect(screen.getByText("Show again")).not.toBeNull()
    })

    it("should hide the show-in-explorer entry in a view without the explorer sidebar", async () => {
        // Arrange & Act
        await renderMenu({ origin: "dependencyMap", hasExplorer: false })

        // Assert
        expect(screen.queryByText("Show in Explorer")).toBe(null)
    })

    it("should hide the show-in-explorer entry when the right-click came from the explorer", async () => {
        // Arrange & Act
        await renderMenu({ origin: "explorer" })

        // Assert
        expect(screen.queryByText("Show in Explorer")).toBe(null)
    })

    it("should offer nothing but the path where the view has no map to shape", async () => {
        // Arrange & Act
        const { container } = await renderMenu({
            node: folderNode,
            origin: "explorer",
            capabilities: { showMapActions: false, jumpTargetViews: [] }
        })

        // Assert
        expect(screen.getByText("…/src")).not.toBe(null)
        expect(screen.queryByText("Focus")).toBe(null)
        expect(screen.queryByText("Keep Highlight")).toBe(null)
        expect(screen.queryByText("Flatten & decolor")).toBe(null)
        expect(screen.queryByText("Exclude")).toBe(null)
        expect(screen.queryByText("Show in Domain")).toBe(null)
        expect(container.querySelector(".colorButton")).toBe(null)
    })

    it("should hand the node over to the jump target view and close", async () => {
        // Arrange
        await renderMenu({ capabilities: { showMapActions: false, jumpTargetViews: ["metrics"] } })
        const viewHandoffStore = TestBed.inject(ViewHandoffStore)
        const navigateByUrl = jest.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true)

        // Act
        fireEvent.click(screen.getByText("Show in Metrics"))

        // Assert
        expect(viewHandoffStore.takeNodeFor("metrics")).toBe("/root/src/RatingBean.java")
        expect(navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics)
    })

    it("should hide the jump to the domain view while no domain data is loaded", async () => {
        // Arrange & Act
        await renderMenu({ hasDomainData: false })

        // Assert
        expect(screen.queryByText("Show in Domain")).toBe(null)
    })

    it("should offer the jump to the domain view once domain data is loaded", async () => {
        // Arrange & Act
        await renderMenu()

        // Assert
        expect(screen.getByText("Show in Domain")).not.toBe(null)
    })

    it("should hide the jump to the dependency view for a node the dependency graph cannot show", async () => {
        // Arrange & Act
        await renderMenu({ pathsWithDependencyLevels: new Set(["/root/src"]) })

        // Assert
        expect(screen.queryByText("Show in Dependencies")).toBe(null)
    })

    it("should offer the jump to the dependency view for a node in the dependency graph, next to the domain view", async () => {
        // Arrange
        await renderMenu({ pathsWithDependencyLevels: new Set(["/root/src", "/root/src/RatingBean.java"]) })
        const navigateByUrl = jest.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true)
        const offeredJumps = screen.getAllByText(/^\s*Show in (Domain|Dependencies)\s*$/).map(item => item.textContent.trim())

        // Act
        fireEvent.click(screen.getByText("Show in Dependencies"))

        // Assert
        expect(offeredJumps).toEqual(["Show in Domain", "Show in Dependencies"])
        expect(TestBed.inject(ViewHandoffStore).takeNodeFor("dependencies")).toBe("/root/src/RatingBean.java")
        expect(navigateByUrl).toHaveBeenCalledWith(routeLinks.dependencies)
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
        fireEvent.click(screen.getByText("Flatten & decolor"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(
            addFlattenedNodes({ items: [{ path: "/root/src/RatingBean.java", nodeType: NodeType.FILE }] })
        )
    })

    it("should offer to show a flattened node again", async () => {
        // Arrange & Act — flatness is answered by the map, not by a flag on the node
        await renderMenu({ node: { ...fileNode }, isFlattened: () => true })

        // Assert
        expect(screen.queryByText("Flatten & decolor")).toBe(null)
        expect(screen.getByText("Show")).not.toBe(null)
    })

    it("should exclude the node when clicking exclude", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu()

        // Act
        fireEvent.click(screen.getByText("Exclude"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(
            addExcludedNodesIfNotResultsInEmptyMap({
                items: [{ path: "/root/src/RatingBean.java", nodeType: NodeType.FILE }]
            })
        )
    })

    it("should offer to remove the highlight when the node is constantly highlighted", async () => {
        // Act
        await renderMenu({ keptHighlightPaths: [fileNode.path] })

        // Assert
        expect(screen.queryByText("Keep Highlight")).toBe(null)
        expect(screen.getByText("Remove Highlight")).not.toBe(null)
    })

    it("should keep the highlight on a folder and everything inside it", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu({ node: folderNode })

        // Act
        fireEvent.click(screen.getByText("Keep Highlight"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(keepHighlight({ paths: [folderNode.path, fileNode.path] }))
    })

    it("should remove the kept highlight from a folder and everything inside it", async () => {
        // Arrange
        const { dispatchSpy } = await renderMenu({ node: folderNode, keptHighlightPaths: [folderNode.path, fileNode.path] })

        // Act
        fireEvent.click(screen.getByText("Remove Highlight"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(removeKeptHighlight({ paths: [folderNode.path, fileNode.path] }))
    })
})
