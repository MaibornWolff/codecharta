import { Provider } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { StoreModule } from "@ngrx/store"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { appReducers, setStateMiddleware } from "../../../../stores/rootStore/store"
import { EXPLORER_CONTEXT_MENU, ExplorerContextMenu } from "../../explorerContextMenu"
import {
    createExplorerContextMenuMock,
    createExplorerRowMock,
    createExplorerSearchMock,
    createExplorerSelectionMock
} from "../../explorerPorts.mocks"
import { EXPLORER_ROW, ExplorerRow } from "../../explorerRow"
import { EXPLORER_SEARCH } from "../../explorerSearch.port"
import { EXPLORER_SELECTION, ExplorerSelection } from "../../explorerSelection"
import { provideViewScopedExplorerState } from "../../provideViewScopedExplorerState"
import { ExplorerRevealService } from "../../services/explorerReveal.service"
import { ExplorerScrollHostService } from "../../services/explorerScrollHost.service"
import { ExplorerTreeLevelComponent } from "./explorerTreeLevel.component"
import { rootNode } from "./mocks"

describe("ExplorerTreeLevelComponent", () => {
    const componentInputs = {
        depth: 0,
        node: rootNode
    }

    const rootNodePath = componentInputs.node.path
    const parentLeafPath = componentInputs.node.children.find(childNode => childNode.name === "ParentLeaf").path

    let row: ExplorerRow
    let selection: ExplorerSelection
    let contextMenu: ExplorerContextMenu | null

    const configureWithPorts = (
        overrides: {
            row?: ExplorerRow
            selection?: ExplorerSelection
            contextMenu?: ExplorerContextMenu | null
            searchedNodePaths?: Set<string>
        } = {}
    ) => {
        row = overrides.row ?? createExplorerRowMock()
        selection = overrides.selection ?? createExplorerSelectionMock()
        contextMenu = overrides.contextMenu === undefined ? createExplorerContextMenuMock() : overrides.contextMenu
        const providers: Provider[] = [
            ...provideViewScopedExplorerState("metrics"),
            { provide: EXPLORER_ROW, useValue: row },
            { provide: EXPLORER_SELECTION, useValue: selection },
            {
                provide: EXPLORER_SEARCH,
                useValue: createExplorerSearchMock({ searchedNodePaths$: of(overrides.searchedNodePaths ?? new Set<string>()) })
            }
        ]
        if (contextMenu !== null) {
            providers.push({ provide: EXPLORER_CONTEXT_MENU, useValue: contextMenu })
        }
        TestBed.configureTestingModule({
            imports: [ExplorerTreeLevelComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers
        })
    }

    beforeEach(() => {
        localStorage.clear()
        configureWithPorts()
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
        const firstLevelFolder = container.querySelector("#metrics\\:\\/root\\/ParentLeaf")
        expect(container.querySelector("#metrics\\:\\/root\\/ParentLeaf\\/smallLeaf")).toBeFalsy()

        // Act
        await userEvent.click(firstLevelFolder)

        // Assert
        await waitFor(() => expect(container.querySelector("#metrics\\:\\/root\\/ParentLeaf\\/smallLeaf")).toBeTruthy())
    })

    it("should mark search-result rows", async () => {
        // Arrange
        configureWithPorts({ searchedNodePaths: new Set(["/root/bigLeaf"]) })

        // Act
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

        // Assert
        await waitFor(() => {
            const span = container.querySelector("#metrics\\:\\/root\\/bigLeaf .node-name")
            expect(span?.classList.contains("text-primary")).toBe(true)
        })
    })

    it("should tell the selection port to select the node on click", async () => {
        // Arrange — the selection port publishes the path; here we only verify the delegation
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const firstLevelFolder = container.querySelector("#metrics\\:\\/root\\/ParentLeaf")

        // Act
        await userEvent.click(firstLevelFolder)

        // Assert
        expect(selection.select).toHaveBeenCalledWith(expect.objectContaining({ path: parentLeafPath }))
    })

    it("should tell the selection port to deselect when an open folder is clicked closed", async () => {
        // Arrange
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const rootRow = container.querySelector("#metrics\\:\\/root")

        // Act
        await userEvent.click(rootRow)

        // Assert
        await waitFor(() => expect(selection.deselect).toHaveBeenCalledTimes(1))
        expect(selection.select).not.toHaveBeenCalled()
    })

    it("should keep the selection when collapsing a folder for a view that opts out of collapse-clears", async () => {
        // Arrange — the domain word cloud keeps its scope on collapse, so its selection port opts out
        TestBed.resetTestingModule()
        configureWithPorts({ selection: createExplorerSelectionMock({ clearsSelectionOnCollapse: false }) })
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const rootRow = container.querySelector("#metrics\\:\\/root")

        // Act — root renders open at depth 0, so this click collapses it
        await userEvent.click(rootRow)

        // Assert
        expect(selection.deselect).not.toHaveBeenCalled()
    })

    it("should ignore clicks on rows the row projection declares unselectable", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithPorts({
            row: createExplorerRowMock(() => ({
                isSelectable: false,
                isInactive: false,
                isItalic: false,
                isFlattened: false,
                isHidden: false,
                title: "",
                decoration: null,
                markingColor: null
            }))
        })
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

        // Act
        await userEvent.click(container.querySelector("#metrics\\:\\/root\\/bigLeaf"))

        // Assert
        expect(selection.select).not.toHaveBeenCalled()
    })

    it("should open the context menu on right-click and close it when the scroll container scrolls", async () => {
        // Arrange
        const scrollContainer = document.createElement("div")
        document.body.append(scrollContainer)

        const { fixture } = await render(ExplorerTreeLevelComponent, {
            inputs: componentInputs,
            excludeComponentDeclaration: true
        })
        TestBed.inject(ExplorerScrollHostService).register(scrollContainer)
        const contextMenuEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            clientX: 10,
            clientY: 20
        } as unknown as MouseEvent

        // Act
        fixture.componentInstance.openNodeContextMenu(contextMenuEvent)

        // Assert
        expect(contextMenu.open).toHaveBeenCalledWith(expect.objectContaining({ path: rootNodePath }), 10, 20)

        // Act
        scrollContainer.dispatchEvent(new Event("scroll"))

        // Assert
        expect(contextMenu.close).toHaveBeenCalledTimes(1)

        // Cleanup
        scrollContainer.remove()
    })

    it("should not open a context menu when the view provides none, leaving the event untouched", async () => {
        // Arrange — the domain view provides no context menu, so a right-click must mark nothing
        TestBed.resetTestingModule()
        configureWithPorts({ contextMenu: null })
        const { fixture } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const contextMenuEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            clientX: 10,
            clientY: 20
        } as unknown as MouseEvent

        // Act
        fixture.componentInstance.openNodeContextMenu(contextMenuEvent)

        // Assert
        expect(contextMenuEvent.preventDefault).not.toHaveBeenCalled()
    })

    it("should tell the selection port on hover and unhover", async () => {
        // Arrange
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const firstLevelFolder = container.querySelector("#metrics\\:\\/root\\/ParentLeaf")

        // Act
        await userEvent.hover(firstLevelFolder)

        // Assert
        await waitFor(() => {
            expect(selection.hover).toHaveBeenCalledWith(expect.objectContaining({ name: "ParentLeaf" }), expect.any(Object))
        })

        // Act
        await userEvent.unhover(firstLevelFolder)

        // Assert
        await waitFor(() => expect(selection.hoverEnd).toHaveBeenCalled())
    })

    it("should render the trailing decoration the row projection supplies", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithPorts({
            row: createExplorerRowMock(node => ({
                isSelectable: true,
                isInactive: false,
                isItalic: false,
                isFlattened: false,
                isHidden: false,
                title: "",
                decoration: node.name === "root" ? "42% / 2" : null,
                markingColor: null
            }))
        })

        // Act
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

        // Assert
        expect(container.querySelector("#metrics\\:\\/root").textContent).toContain("42% / 2")
        expect(container.querySelector("#metrics\\:\\/root\\/bigLeaf").textContent).not.toContain("42% / 2")
    })

    it("should not render a row the projection reports as hidden", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithPorts({
            row: createExplorerRowMock(node => ({
                isSelectable: true,
                isInactive: false,
                isItalic: false,
                isFlattened: false,
                isHidden: node.name === "bigLeaf",
                title: "",
                decoration: null,
                markingColor: null
            }))
        })

        // Act
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

        // Assert
        expect(container.querySelector("#metrics\\:\\/root\\/bigLeaf")).toBeFalsy()
        expect(container.querySelector("#metrics\\:\\/root\\/ParentLeaf")).toBeTruthy()
    })

    it("should dim and italicise a row the projection reports as such", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithPorts({
            row: createExplorerRowMock(() => ({
                isSelectable: true,
                isInactive: true,
                isItalic: true,
                isFlattened: false,
                isHidden: false,
                title: "No Node Area for Chosen Metric",
                decoration: null,
                markingColor: null
            }))
        })

        // Act
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

        // Assert
        const row = container.querySelector("#metrics\\:\\/root")
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
            expect(container.querySelector("#metrics\\:\\/root\\/ParentLeaf\\/smallLeaf")).toBeFalsy()

            // Act
            TestBed.inject(ExplorerRevealService).revealNode("/root/ParentLeaf/smallLeaf")

            // Assert
            await waitFor(() => expect(container.querySelector("#metrics\\:\\/root\\/ParentLeaf\\/smallLeaf")).toBeTruthy())
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
            expect(container.querySelector("#metrics\\:\\/root\\/ParentLeaf\\/smallLeaf")).toBeFalsy()
        })

        it("should flash the revealed row", async () => {
            // Arrange
            const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })

            // Act
            TestBed.inject(ExplorerRevealService).revealNode("/root/bigLeaf")

            // Assert
            await waitFor(() =>
                expect(container.querySelector("#metrics\\:\\/root\\/bigLeaf").classList.contains("bg-primary/20")).toBe(true)
            )
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
