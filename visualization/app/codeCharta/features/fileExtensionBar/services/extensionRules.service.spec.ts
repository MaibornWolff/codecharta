import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import {
    CcState,
    CodeMapNode,
    NodeRule,
    NodeType,
    RadialFolderStyle,
    RadialFolderValue,
    RuleEffect,
    SortingOption
} from "../../../model/codeCharta.model"
import { hoveredNodeSelector } from "../../../renderer/renderModel/hoveredNode.selector"
import { selectedNodeSelector } from "../../../renderer/renderModel/selectedNode.selector"
import { defaultMapState } from "../../../stores/mapState/mapState.read.facade"
import { CategorizedMetricDistribution, OTHER_EXTENSION } from "../../../util/fileExtension/fileExtensionCalculator"
import { ExtensionRuleAction } from "../effects/extensionRule/extensionRule.effect"
import { hoveredNodeMetricDistributionSelector } from "../selectors/hoveredNodeMetricDistribution.selector"
import { addPrefixWildcard, buildGlobPatterns, ExtensionRulesService, expandExtensions } from "./extensionRules.service"

class NodeRuleBuilder {
    private path = ""
    private nodeType?: NodeType

    build(): NodeRule {
        return {
            path: this.path,
            nodeType: this.nodeType
        }
    }

    withPath(path: string): this {
        this.path = path
        return this
    }
}

describe("ExtensionRulesService", () => {
    let fixture: ExtensionRulesService
    let store: MockStore

    const mockDistribution: CategorizedMetricDistribution = {
        others: [
            {
                fileExtension: "a",
                absoluteMetricValue: 1,
                relativeMetricValue: 1,
                color: ""
            },
            {
                fileExtension: "b",
                absoluteMetricValue: 1,
                relativeMetricValue: 1,
                color: ""
            }
        ],
        none: [],
        visible: [
            {
                fileExtension: "ts",
                absoluteMetricValue: 1,
                relativeMetricValue: 1,
                color: ""
            }
        ]
    }

    const mockFlattenedTypescriptItem: NodeRule = new NodeRuleBuilder().withPath("*.ts").build()
    const mockFlattenedOtherItems: NodeRule[] = [
        new NodeRuleBuilder().withPath("*.a").build(),
        new NodeRuleBuilder().withPath("*.b").build()
    ]
    const mockFlattenedNodes: NodeRule[] = [mockFlattenedTypescriptItem, ...mockFlattenedOtherItems]

    const initialState: Partial<CcState> = {
        currentFilesAreSampleFiles: false,
        mapState: {
            ...defaultMapState,
            areaMetric: "rloc",
            heightMetric: "rloc",
            colorMetric: "rloc",
            distributionMetric: "rloc",
            edgeMetric: ""
        },
        metricsLensSource: {
            attributeTypes: {},
            attributeDescriptors: null
        },
        dependencyLensSource: {
            attributeTypes: {}
        },
        files: [],
        preferences: {
            isPresentationMode: false,
            resetCameraIfNewFileIsLoaded: true,
            centerMapZoom: 140,
            maxTreeMapFiles: 100,
            experimentalFeaturesEnabled: false,
            screenshotToClipboardEnabled: false,
            isColorMetricLinkedToHeightMetric: false,
            sorting: { option: SortingOption.NAME, orderAscending: true },
            radialFolderValue: RadialFolderValue.Max,
            radialFolderStyle: RadialFolderStyle.Tinted,
            radialFolderTint: 0.5,
            radialLevels: 3
        },
        sharedView: {
            focusedNodePath: [],
            searchPattern: "",
            excludedNodes: [],
            flattenedNodes: mockFlattenedNodes,
            metricRules: [],
            markedPackages: [],
            hoveredNodePath: null,
            hoveredFileExtensions: [],
            selectedNodePath: null,
            rightClickedNodeData: null
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ExtensionRulesService,
                provideMockStore({
                    initialState
                })
            ]
        })
    })

    beforeEach(() => {
        fixture = TestBed.inject(ExtensionRulesService)
        store = TestBed.inject(MockStore)

        store.overrideSelector(hoveredNodeMetricDistributionSelector, mockDistribution)
        store.refreshState()
    })

    afterEach(() => {
        store.resetSelectors()
        store.refreshState()
    })

    it("should be created", () => {
        expect(fixture).toBeTruthy()
    })

    describe.each<[RuleEffect]>([["flatten"], ["exclude"]])(`Flatten and exclude`, actionType => {
        it(`should dispatch ${actionType} action with wildcard prefix when ${actionType}ing an extension`, () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture[actionType]("ts")

            const expectedAction: ExtensionRuleAction = {
                action: { effect: actionType },
                extensions: ["*.ts"],
                type: "ExtensionRuleAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it(`should dispatch ${actionType} action with wildcard prefix for all other extensions when ${actionType}ing OTHER_EXTENSION`, () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture[actionType](OTHER_EXTENSION)
            const expectedAction: ExtensionRuleAction = {
                action: { effect: actionType },
                extensions: mockDistribution.others.map(it => addPrefixWildcard(it.fileExtension)),
                type: "ExtensionRuleAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })
    })

    describe("show", () => {
        it("should dispatch remove action when showing a flattened extension", () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show("ts")
            expect(dispatchSpy).toHaveBeenCalledWith({
                items: [mockFlattenedTypescriptItem],
                type: "REMOVE_FLATTENED_NODES"
            })
        })
        it("should dispatch remove action for all other items when showing OTHER_EXTENSION", () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show(OTHER_EXTENSION)
            expect(dispatchSpy).toHaveBeenCalledWith({
                items: mockFlattenedOtherItems,
                type: "REMOVE_FLATTENED_NODES"
            })
        })
    })

    describe("Scoped flatten operations", () => {
        const mockHoveredNode: CodeMapNode = {
            name: "src",
            path: "/root/src",
            type: NodeType.FOLDER,
            attributes: {},
            isExcluded: false,
            children: []
        }

        const mockSelectedNode: CodeMapNode = {
            name: "components",
            path: "/root/components",
            type: NodeType.FOLDER,
            attributes: {},
            isExcluded: false,
            children: []
        }

        it("should scope operation to hovered folder path when flattening extension with hovered folder", () => {
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.flatten("ts")

            const expectedAction: ExtensionRuleAction = {
                action: { effect: "flatten" },
                extensions: ["/root/src/**/*.ts"],
                type: "ExtensionRuleAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it("should scope operation to selected folder path when excluding extension with selected folder and no hover", () => {
            store.overrideSelector(hoveredNodeSelector, null)
            store.overrideSelector(selectedNodeSelector, mockSelectedNode)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.exclude("js")

            const expectedAction: ExtensionRuleAction = {
                action: { effect: "exclude" },
                extensions: ["/root/components/**/*.js"],
                type: "ExtensionRuleAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it("should prioritize hovered node over selected node when both exist during flatten", () => {
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, mockSelectedNode)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.flatten("ts")

            const expectedAction: ExtensionRuleAction = {
                action: { effect: "flatten" },
                extensions: ["/root/src/**/*.ts"],
                type: "ExtensionRuleAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it("should apply global operation when excluding extension with no hovered or selected node", () => {
            store.overrideSelector(hoveredNodeSelector, null)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.exclude("ts")

            const expectedAction: ExtensionRuleAction = {
                action: { effect: "exclude" },
                extensions: ["*.ts"],
                type: "ExtensionRuleAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it("should scope all other extensions to hovered folder when flattening OTHER_EXTENSION", () => {
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.flatten(OTHER_EXTENSION)

            const expectedAction: ExtensionRuleAction = {
                action: { effect: "flatten" },
                extensions: ["/root/src/**/*.a", "/root/src/**/*.b"],
                type: "ExtensionRuleAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it("should apply global operation when excluding extension with hovered file instead of folder", () => {
            const mockHoveredFile: CodeMapNode = {
                name: "file.ts",
                path: "/root/src/file.ts",
                type: NodeType.FILE,
                attributes: {},
                isExcluded: false
            }

            store.overrideSelector(hoveredNodeSelector, mockHoveredFile)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.exclude("ts")

            const expectedAction: ExtensionRuleAction = {
                action: { effect: "exclude" },
                extensions: ["*.ts"],
                type: "ExtensionRuleAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })
    })

    describe("getIsFlattenedByFileExtension", () => {
        it("should return false when hovering folder without a scoped flatten rule for that folder", done => {
            const folderB: CodeMapNode = {
                name: "components",
                path: "/root/components",
                type: NodeType.FOLDER,
                attributes: {},
                isExcluded: false,
                children: []
            }

            const scopedItemForFolderA = new NodeRuleBuilder().withPath("/root/src/**/*.ts").build()

            store.setState({
                ...initialState,
                sharedView: {
                    ...initialState.sharedView,
                    excludedNodes: [scopedItemForFolderA]
                }
            })
            store.overrideSelector(hoveredNodeSelector, folderB)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            fixture.getIsFlattenedByFileExtension("ts").subscribe(isFlattened => {
                expect(isFlattened).toBe(false)
                done()
            })
        })
    })

    describe("Removing scoped flatten rules", () => {
        const mockHoveredNode: CodeMapNode = {
            name: "src",
            path: "/root/src",
            type: NodeType.FOLDER,
            attributes: {},
            isExcluded: false,
            children: []
        }

        const mockScopedNodeRules: NodeRule[] = [
            new NodeRuleBuilder().withPath("/root/src/**/*.ts").build(),
            new NodeRuleBuilder().withPath("/root/src/**/*.js").build()
        ]

        beforeEach(() => {
            store.setState({
                ...initialState,
                sharedView: {
                    ...initialState.sharedView,
                    flattenedNodes: mockScopedNodeRules
                }
            })
            store.refreshState()
        })

        it("should remove scoped item when showing extension while hovering the same folder", () => {
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show("ts")

            expect(dispatchSpy).toHaveBeenCalledWith({
                items: [mockScopedNodeRules[0]],
                type: "REMOVE_FLATTENED_NODES"
            })
        })

        it("should remove scoped item when showing extension while selecting the same folder", () => {
            store.overrideSelector(hoveredNodeSelector, null)
            store.overrideSelector(selectedNodeSelector, mockHoveredNode)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show("ts")

            expect(dispatchSpy).toHaveBeenCalledWith({
                items: [mockScopedNodeRules[0]],
                type: "REMOVE_FLATTENED_NODES"
            })
        })

        it("should remove global item when showing extension with no context and both scoped and global items exist", () => {
            const globalItem = new NodeRuleBuilder().withPath("*.ts").build()
            store.setState({
                ...initialState,
                sharedView: {
                    ...initialState.sharedView,
                    excludedNodes: [...mockScopedNodeRules, globalItem]
                }
            })
            store.overrideSelector(hoveredNodeSelector, null)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show("ts")

            expect(dispatchSpy).toHaveBeenCalledWith({
                items: [globalItem],
                type: "REMOVE_FLATTENED_NODES"
            })
        })

        it("should remove all scoped other items when showing OTHER_EXTENSION while hovering the same folder", () => {
            const mockScopedOtherItems = [
                new NodeRuleBuilder().withPath("/root/src/**/*.a").build(),
                new NodeRuleBuilder().withPath("/root/src/**/*.b").build()
            ]

            store.setState({
                ...initialState,
                sharedView: {
                    ...initialState.sharedView,
                    flattenedNodes: mockScopedOtherItems
                }
            })
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show(OTHER_EXTENSION)

            expect(dispatchSpy).toHaveBeenCalledWith({
                items: mockScopedOtherItems,
                type: "REMOVE_FLATTENED_NODES"
            })
        })

        it("should prioritize hovered scope over selected scope when showing extension with both nodes present", () => {
            const mockSelectedNode: CodeMapNode = {
                name: "components",
                path: "/root/components",
                type: NodeType.FOLDER,
                attributes: {},
                isExcluded: false,
                children: []
            }

            const hoveredScopedItem = new NodeRuleBuilder().withPath("/root/src/**/*.ts").build()
            const selectedScopedItem = new NodeRuleBuilder().withPath("/root/components/**/*.ts").build()

            store.setState({
                ...initialState,
                sharedView: {
                    ...initialState.sharedView,
                    flattenedNodes: [hoveredScopedItem, selectedScopedItem]
                }
            })
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, mockSelectedNode)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show("ts")

            expect(dispatchSpy).toHaveBeenCalledWith({
                items: [hoveredScopedItem],
                type: "REMOVE_FLATTENED_NODES"
            })
        })
    })

    describe("Pure function tests", () => {
        describe("expandExtensions", () => {
            it("should return single extension when not OTHER", () => {
                const result = expandExtensions("ts", mockDistribution)
                expect(result).toEqual(["ts"])
            })

            it("should expand OTHER_EXTENSION to all other extensions excluding NO_EXTENSION", () => {
                const result = expandExtensions(OTHER_EXTENSION, mockDistribution)
                expect(result).toEqual(["a", "b"])
            })
        })

        describe("buildGlobPatterns", () => {
            it("should build global pattern when no context node", () => {
                const result = buildGlobPatterns("ts", mockDistribution, undefined)
                expect(result).toEqual(["*.ts"])
            })

            it("should build scoped pattern when context node is a folder", () => {
                const folderNode: CodeMapNode = {
                    name: "src",
                    path: "/root/src",
                    type: NodeType.FOLDER,
                    attributes: {},
                    isExcluded: false,
                    children: []
                }
                const result = buildGlobPatterns("ts", mockDistribution, folderNode)
                expect(result).toEqual(["/root/src/**/*.ts"])
            })

            it("should build global pattern when context node is a file", () => {
                const fileNode: CodeMapNode = {
                    name: "file.ts",
                    path: "/root/file.ts",
                    type: NodeType.FILE,
                    attributes: {},
                    isExcluded: false
                }
                const result = buildGlobPatterns("ts", mockDistribution, fileNode)
                expect(result).toEqual(["*.ts"])
            })

            it("should build multiple scoped patterns for OTHER_EXTENSION", () => {
                const folderNode: CodeMapNode = {
                    name: "src",
                    path: "/root/src",
                    type: NodeType.FOLDER,
                    attributes: {},
                    isExcluded: false,
                    children: []
                }
                const result = buildGlobPatterns(OTHER_EXTENSION, mockDistribution, folderNode)
                expect(result).toEqual(["/root/src/**/*.a", "/root/src/**/*.b"])
            })
        })
    })
})
