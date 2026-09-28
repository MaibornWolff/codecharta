import { HttpClient } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TEST_DELTA_MAP_A, VALID_NODE_WITH_MCC } from "../../../mocks/dataMocks"
import { hoveredNodeSelector } from "../../../renderer/renderModel/hoveredNode.selector"
import { selectedNodeSelector } from "../../../renderer/renderModel/selectedNode.selector"
import { defaultState } from "../../../stores/rootStore/state.manager"
import { topLevelNodeSelector } from "../selectors/topLevelNode.selector"
import { NodeSelectionService } from "./nodeSelection.service"

describe("NodeSelectionService", () => {
    let store
    let nodeSelectionService: NodeSelectionService
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: HttpClient, useValue: {} },
                { provide: State, useValue: { getValue: () => null } },
                provideMockStore({
                    selectors: [
                        {
                            selector: hoveredNodeSelector,
                            value: null
                        },
                        {
                            selector: selectedNodeSelector,
                            value: null
                        },
                        {
                            selector: topLevelNodeSelector,
                            value: undefined
                        }
                    ]
                })
            ]
        })

        store = TestBed.inject(MockStore)
        nodeSelectionService = TestBed.inject(NodeSelectionService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should return hoverednode if hoverednode available", done => {
        store.setState(defaultState)
        store.overrideSelector(topLevelNodeSelector, TEST_DELTA_MAP_A.map)
        store.overrideSelector(hoveredNodeSelector, VALID_NODE_WITH_MCC)
        store.refreshState()

        nodeSelectionService.createNodeObservable().subscribe(node => {
            expect(node).toEqual(VALID_NODE_WITH_MCC)
            done()
        })
    })

    it("should return selectedNode if selectedNode available and hoverednode not available", done => {
        store.setState(defaultState)
        store.overrideSelector(topLevelNodeSelector, TEST_DELTA_MAP_A.map)
        store.overrideSelector(selectedNodeSelector, VALID_NODE_WITH_MCC)
        store.refreshState()

        nodeSelectionService.createNodeObservable().subscribe(node => {
            expect(node).toEqual(VALID_NODE_WITH_MCC)
            done()
        })
    })

    it("should return the top-level node when neither a node is hovered nor selected", done => {
        // Arrange
        store.setState(defaultState)
        store.overrideSelector(topLevelNodeSelector, TEST_DELTA_MAP_A.map)
        store.refreshState()

        // Act
        nodeSelectionService.createNodeObservable().subscribe(node => {
            // Assert
            expect(node).toBe(TEST_DELTA_MAP_A.map)
            done()
        })
    })

    it("should return the new top-level node when the focus changes", done => {
        // Arrange
        const focusedFolder = TEST_DELTA_MAP_A.map.children[0]
        store.setState(defaultState)
        store.overrideSelector(topLevelNodeSelector, TEST_DELTA_MAP_A.map)
        store.refreshState()
        const emittedNodes = []

        // Act
        nodeSelectionService.createNodeObservable().subscribe(node => {
            emittedNodes.push(node)
            if (emittedNodes.length === 2) {
                // Assert
                expect(emittedNodes).toEqual([TEST_DELTA_MAP_A.map, focusedFolder])
                done()
            }
        })
        store.overrideSelector(topLevelNodeSelector, focusedFolder)
        store.refreshState()
    })

    it("should return undefined when no map is loaded", done => {
        // Arrange
        store.setState(defaultState)
        store.refreshState()

        // Act
        nodeSelectionService.createNodeObservable().subscribe(node => {
            // Assert
            expect(node).toBeUndefined()
            done()
        })
    })
})
