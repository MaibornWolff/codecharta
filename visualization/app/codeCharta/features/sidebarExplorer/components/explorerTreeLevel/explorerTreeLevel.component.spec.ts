import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { IdToBuildingService } from "../../../../features/codeMap/facade"
import * as SearchedNodePathsSelector from "../../../../state/selectors/searchedNodes/searchedNodePaths.selector"
import { setHoveredNodeId } from "../../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { setRightClickedNodeData } from "../../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { defaultRightClickedNodeData } from "../../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.reducer"
import * as RightClickedNodeDataSelector from "../../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import * as AreaMetricSelector from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { appReducers, setStateMiddleware } from "../../../../state/store/state.manager"
import { CodeMapMouseEventService } from "../../../../features/codeMap/facade"
import { CodeMapTooltipService } from "../../../../features/codeMap/facade"
import { CodeMapBuilding } from "../../../../features/codeMap/facade"
import { ThreeRendererService } from "../../../../features/codeMap/facade"
import { ThreeSceneService } from "../../../../features/codeMap/facade"
import { ExplorerRevealService } from "../../services/explorerReveal.service"
import { ExplorerTreeLevelComponent } from "./explorerTreeLevel.component"
import { rootNode } from "./mocks"

describe("ExplorerTreeLevelComponent", () => {
    const componentInputs = {
        depth: 0,
        node: rootNode
    }

    const rootNodeId = componentInputs.node.id
    const parentLeafId = componentInputs.node.children.find(childNode => childNode.name === "ParentLeaf").id
    const bigLeafId = componentInputs.node.children.find(childNode => childNode.name === "bigLeaf").id
    const smallLeafId = componentInputs.node.children.find(childNode => childNode.name === "ParentLeaf").children[0].id

    const rootNodeBuilding = new CodeMapBuilding(rootNodeId, null, null, null)
    const parentLeafBuilding = new CodeMapBuilding(parentLeafId, null, null, null)
    const bigLeafBuilding = new CodeMapBuilding(bigLeafId, null, null, null)
    const smallLeafBuilding = new CodeMapBuilding(smallLeafId, null, null, null)

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExplorerTreeLevelComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: [
                {
                    provide: ThreeSceneService,
                    useValue: { selectBuilding: jest.fn(), clearSelection: jest.fn(), clearConstantHighlight: jest.fn() }
                },
                {
                    provide: IdToBuildingService,
                    useValue: {
                        get: jest.fn(id => {
                            switch (id) {
                                case rootNodeId:
                                    return rootNodeBuilding
                                case parentLeafId:
                                    return parentLeafBuilding
                                case bigLeafId:
                                    return bigLeafBuilding
                                case smallLeafId:
                                    return smallLeafBuilding
                            }
                        }),
                        has: jest.fn(() => true),
                        buildingIds$: of(new Set([rootNodeId, parentLeafId, bigLeafId, smallLeafId]))
                    }
                },
                { provide: ThreeRendererService, useValue: { render: jest.fn() } },
                {
                    provide: CodeMapMouseEventService,
                    useValue: {
                        drawLabelSelectedBuilding: jest.fn(),
                        hoverNode: jest.fn(),
                        unhoverNode: jest.fn()
                    }
                },
                {
                    provide: CodeMapTooltipService,
                    useValue: {
                        show: jest.fn(),
                        hide: jest.fn()
                    }
                }
            ]
        })

        jest.spyOn(AreaMetricSelector, "areaMetricSelector").mockReturnValue("unary")
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

    it("should select corresponding building on click", async () => {
        // Arrange
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const codeMapMouseEventService = TestBed.inject(CodeMapMouseEventService)
        const threeSceneService = TestBed.inject(ThreeSceneService)
        const threeRendererService = TestBed.inject(ThreeRendererService)
        const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

        // Act
        await userEvent.click(firstLevelFolder)

        // Assert
        await waitFor(() => {
            expect(codeMapMouseEventService.drawLabelSelectedBuilding).toHaveBeenCalledWith(parentLeafBuilding)
            expect(threeSceneService.selectBuilding).toHaveBeenCalledWith(parentLeafBuilding)
            expect(threeSceneService.clearConstantHighlight).toHaveBeenCalledTimes(1)
            expect(threeRendererService.render).toHaveBeenCalledTimes(1)
        })
    })

    it("should clear selection when an open folder is clicked closed", async () => {
        // Arrange
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const threeSceneService = TestBed.inject(ThreeSceneService)
        const rootRow = container.querySelector("#\\/root")

        // Act
        await userEvent.click(rootRow)

        // Assert
        await waitFor(() => {
            expect(threeSceneService.clearSelection).toHaveBeenCalledTimes(1)
            expect(threeSceneService.selectBuilding).not.toHaveBeenCalled()
        })
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
                value: { nodeId: rootNodeId, xPositionOfRightClickEvent: 10, yPositionOfRightClickEvent: 20, origin: "explorer" }
            })
        )

        // Act
        scrollContainer.dispatchEvent(new Event("scroll"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setRightClickedNodeData({ value: null }))

        // Cleanup
        scrollContainer.remove()
    })

    it("should hover and unhover the corresponding building", async () => {
        // Arrange
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const codeMapMouseEventService = TestBed.inject(CodeMapMouseEventService)
        const store = TestBed.inject(Store)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

        // Act
        await userEvent.hover(firstLevelFolder)

        // Assert
        await waitFor(() => {
            expect(codeMapMouseEventService.hoverNode).toHaveBeenCalledWith(parentLeafId)
            expect(dispatchSpy).toHaveBeenCalledWith(setHoveredNodeId({ value: parentLeafId }))
        })

        // Act
        await userEvent.unhover(firstLevelFolder)

        // Assert
        await waitFor(() => {
            expect(codeMapMouseEventService.unhoverNode).toHaveBeenCalledTimes(1)
            expect(dispatchSpy).toHaveBeenCalledWith(setHoveredNodeId({ value: null }))
        })
    })

    it("should show the tooltip for the hovered row and hide it on unhover", async () => {
        // Arrange
        const { container } = await render(ExplorerTreeLevelComponent, { inputs: componentInputs, excludeComponentDeclaration: true })
        const tooltipService = TestBed.inject(CodeMapTooltipService)
        const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

        // Act
        await userEvent.hover(firstLevelFolder)

        // Assert
        await waitFor(() => {
            expect(tooltipService.show).toHaveBeenCalledWith(
                expect.objectContaining({ name: "ParentLeaf" }),
                expect.any(Number),
                expect.any(Number)
            )
        })

        // Act
        await userEvent.unhover(firstLevelFolder)

        // Assert
        await waitFor(() => expect(tooltipService.hide).toHaveBeenCalled())
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
    })
})
