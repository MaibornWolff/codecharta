import { HttpClient } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { hoveredNodeSelector } from "../../state/selectors/hoveredNode.selector"
import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"
import { defaultState } from "../../state/store/state.manager"
import { TEST_DELTA_MAP_A, TEST_NODE_LEAF_0_LENGTH, TEST_NODES, VALID_NODE_WITH_MCC } from "../../util/dataMocks"
import { CodeMapRenderService } from "../codeMap/codeMap.render.service"
import { NodeSelectionService } from "./nodeSelection.service"

describe("LoadInitialFileService", () => {
    let store
    let nodeSelectionService: NodeSelectionService
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: HttpClient, useValue: {} },
                { provide: State, useValue: { getValue: () => null } },
                {
                    provide: CodeMapRenderService,
                    useValue: {
                        getNodes: jest.fn().mockImplementation(() => TEST_NODES),
                        sortNodes: jest.fn().mockImplementation(input => input)
                    }
                },
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
                            selector: accumulatedDataSelector,
                            value: null
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
        store.overrideSelector(accumulatedDataSelector, {
            unifiedMapNode: TEST_DELTA_MAP_A.map,
            unifiedFileMeta: null
        })
        store.overrideSelector(hoveredNodeSelector, VALID_NODE_WITH_MCC)
        store.refreshState()

        nodeSelectionService.createNodeObservable().subscribe(node => {
            expect(node).toEqual(VALID_NODE_WITH_MCC)
            done()
        })
    })

    it("should return selectedNode if selectedNode available and hoverednode not available", done => {
        store.setState(defaultState)
        store.overrideSelector(accumulatedDataSelector, {
            unifiedMapNode: TEST_DELTA_MAP_A.map,
            unifiedFileMeta: null
        })
        store.overrideSelector(selectedNodeSelector, VALID_NODE_WITH_MCC)
        store.refreshState()

        nodeSelectionService.createNodeObservable().subscribe(node => {
            expect(node).toEqual(VALID_NODE_WITH_MCC)
            done()
        })
    })

    it("should return toplevelnode if both selectedNode and hoverednode are not available", done => {
        store.setState(defaultState)
        store.overrideSelector(accumulatedDataSelector, {
            unifiedMapNode: TEST_DELTA_MAP_A.map,
            unifiedFileMeta: null
        })
        store.refreshState()

        nodeSelectionService.createNodeObservable().subscribe(node => {
            expect(node).toEqual(TEST_NODE_LEAF_0_LENGTH)
            done()
        })
    })
})
