import { TestBed, waitForAsync } from "@angular/core/testing"

import { addPrefixWildcard, BlackListExtensionService, buildGlobPatterns, expandExtensions } from "./blackListExtension.service"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { CategorizedMetricDistribution, OTHER_EXTENSION } from "./selectors/fileExtensionCalculator"
import { BlacklistItem, BlacklistType, CcState, CodeMapNode, ColorMode, NodeType, SortingOption } from "../../codeCharta.model"
import { hoveredNodeMetricDistributionSelector } from "./selectors/hoveredNodeMetricDistribution.selector"
import { BlacklistExtensionAction } from "../../state/effects/blacklistExtension/blacklistExtension.effect"
import { hoveredNodeSelector } from "../../state/selectors/hoveredNode.selector"
import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"

class BlackListItemBuilder {
    private path = ""
    private type: BlacklistType = "flatten"
    private nodeType?: NodeType

    build(): BlacklistItem {
        return {
            path: this.path,
            type: this.type,
            nodeType: this.nodeType
        }
    }

    withPath(path: string): this {
        this.path = path
        return this
    }

    withType(type: BlacklistType): this {
        this.type = type
        return this
    }
}

describe("BlackListExtensionService", () => {
    let fixture: BlackListExtensionService
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

    const mockFlattenedTypescriptItem: BlacklistItem = new BlackListItemBuilder().withPath("*.ts").withType("flatten").build()
    const mockFlattenedOtherItems: BlacklistItem[] = [
        new BlackListItemBuilder().withPath("*.a").withType("flatten").build(),
        new BlackListItemBuilder().withPath("*.b").withType("flatten").build()
    ]
    const mockBlacklist: BlacklistItem[] = [mockFlattenedTypescriptItem, ...mockFlattenedOtherItems]

    const initialState: Partial<CcState> = {
        appStatus: {
            currentFilesAreSampleFiles: false,
            hoveredNodeId: null,
            selectedBuildingId: null,
            rightClickedNodeData: null
        },
        fileSettings: {
            attributeTypes: null,
            attributeDescriptors: null,
            blacklist: mockBlacklist,
            edges: [],
            markedPackages: []
        },
        files: [],
        dynamicSettings: {
            areaMetric: "rloc",
            colorMode: ColorMode.absolute,
            sortingOption: SortingOption.NAME,
            colorRange: { from: null, to: null },
            distributionMetric: "rloc",
            focusedNodePath: [],
            searchPattern: "",
            margin: 0,
            heightMetric: "rloc",
            edgeMetric: "",
            colorMetric: "rloc"
        }
    }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                BlackListExtensionService,
                provideMockStore({
                    initialState
                })
            ]
        })
    }))

    beforeEach(() => {
        fixture = TestBed.inject(BlackListExtensionService)
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

    describe.each<[BlacklistType]>([["flatten"], ["exclude"]])(`Flatten and exclude`, actionType => {
        it(`should dispatch ${actionType} action with wildcard prefix when ${actionType}ing an extension`, () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture[actionType]("ts")

            const expectedAction: BlacklistExtensionAction = {
                action: { type: actionType },
                extensions: ["*.ts"],
                type: "BlacklistExtensionAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it(`should dispatch ${actionType} action with wildcard prefix for all other extensions when ${actionType}ing OTHER_EXTENSION`, () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture[actionType](OTHER_EXTENSION)
            const expectedAction: BlacklistExtensionAction = {
                action: { type: actionType },
                extensions: mockDistribution.others.map(it => addPrefixWildcard(it.fileExtension)),
                type: "BlacklistExtensionAction"
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
                type: "REMOVE_BLACKLIST_ITEMS"
            })
        })
        it("should dispatch remove action for all other items when showing OTHER_EXTENSION", () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show(OTHER_EXTENSION)
            expect(dispatchSpy).toHaveBeenCalledWith({
                items: mockFlattenedOtherItems,
                type: "REMOVE_BLACKLIST_ITEMS"
            })
        })
    })

    describe("Scoped blacklist operations", () => {
        const mockHoveredNode: CodeMapNode = {
            name: "src",
            path: "/root/src",
            type: NodeType.FOLDER,
            attributes: {},
            isExcluded: false,
            isFlattened: false,
            children: []
        }

        const mockSelectedNode: CodeMapNode = {
            name: "components",
            path: "/root/components",
            type: NodeType.FOLDER,
            attributes: {},
            isExcluded: false,
            isFlattened: false,
            children: []
        }

        it("should scope operation to hovered folder path when flattening extension with hovered folder", () => {
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.flatten("ts")

            const expectedAction: BlacklistExtensionAction = {
                action: { type: "flatten" },
                extensions: ["/root/src/**/*.ts"],
                type: "BlacklistExtensionAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it("should scope operation to selected folder path when excluding extension with selected folder and no hover", () => {
            store.overrideSelector(hoveredNodeSelector, null)
            store.overrideSelector(selectedNodeSelector, mockSelectedNode)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.exclude("js")

            const expectedAction: BlacklistExtensionAction = {
                action: { type: "exclude" },
                extensions: ["/root/components/**/*.js"],
                type: "BlacklistExtensionAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it("should prioritize hovered node over selected node when both exist during flatten", () => {
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, mockSelectedNode)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.flatten("ts")

            const expectedAction: BlacklistExtensionAction = {
                action: { type: "flatten" },
                extensions: ["/root/src/**/*.ts"],
                type: "BlacklistExtensionAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it("should apply global operation when excluding extension with no hovered or selected node", () => {
            store.overrideSelector(hoveredNodeSelector, null)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.exclude("ts")

            const expectedAction: BlacklistExtensionAction = {
                action: { type: "exclude" },
                extensions: ["*.ts"],
                type: "BlacklistExtensionAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it("should scope all other extensions to hovered folder when flattening OTHER_EXTENSION", () => {
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.flatten(OTHER_EXTENSION)

            const expectedAction: BlacklistExtensionAction = {
                action: { type: "flatten" },
                extensions: ["/root/src/**/*.a", "/root/src/**/*.b"],
                type: "BlacklistExtensionAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it("should apply global operation when excluding extension with hovered file instead of folder", () => {
            const mockHoveredFile: CodeMapNode = {
                name: "file.ts",
                path: "/root/src/file.ts",
                type: NodeType.FILE,
                attributes: {},
                isExcluded: false,
                isFlattened: false
            }

            store.overrideSelector(hoveredNodeSelector, mockHoveredFile)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.exclude("ts")

            const expectedAction: BlacklistExtensionAction = {
                action: { type: "exclude" },
                extensions: ["*.ts"],
                type: "BlacklistExtensionAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })
    })

    describe("getIsFlattenedByFileExtension", () => {
        it("should return false when hovering folder without scoped blacklist item for that folder", done => {
            const folderB: CodeMapNode = {
                name: "components",
                path: "/root/components",
                type: NodeType.FOLDER,
                attributes: {},
                isExcluded: false,
                isFlattened: false,
                children: []
            }

            const scopedItemForFolderA = new BlackListItemBuilder().withPath("/root/src/**/*.ts").withType("flatten").build()

            store.setState({
                ...initialState,
                fileSettings: {
                    ...initialState.fileSettings,
                    blacklist: [scopedItemForFolderA]
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

    describe("Removing scoped blacklist items", () => {
        const mockHoveredNode: CodeMapNode = {
            name: "src",
            path: "/root/src",
            type: NodeType.FOLDER,
            attributes: {},
            isExcluded: false,
            isFlattened: false,
            children: []
        }

        const mockScopedBlacklistItems: BlacklistItem[] = [
            new BlackListItemBuilder().withPath("/root/src/**/*.ts").withType("flatten").build(),
            new BlackListItemBuilder().withPath("/root/src/**/*.js").withType("flatten").build()
        ]

        beforeEach(() => {
            store.setState({
                ...initialState,
                fileSettings: {
                    ...initialState.fileSettings,
                    blacklist: mockScopedBlacklistItems
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
                items: [mockScopedBlacklistItems[0]],
                type: "REMOVE_BLACKLIST_ITEMS"
            })
        })

        it("should remove scoped item when showing extension while selecting the same folder", () => {
            store.overrideSelector(hoveredNodeSelector, null)
            store.overrideSelector(selectedNodeSelector, mockHoveredNode)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show("ts")

            expect(dispatchSpy).toHaveBeenCalledWith({
                items: [mockScopedBlacklistItems[0]],
                type: "REMOVE_BLACKLIST_ITEMS"
            })
        })

        it("should remove global item when showing extension with no context and both scoped and global items exist", () => {
            const globalItem = new BlackListItemBuilder().withPath("*.ts").withType("flatten").build()
            store.setState({
                ...initialState,
                fileSettings: {
                    ...initialState.fileSettings,
                    blacklist: [...mockScopedBlacklistItems, globalItem]
                }
            })
            store.overrideSelector(hoveredNodeSelector, null)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show("ts")

            expect(dispatchSpy).toHaveBeenCalledWith({
                items: [globalItem],
                type: "REMOVE_BLACKLIST_ITEMS"
            })
        })

        it("should remove all scoped other items when showing OTHER_EXTENSION while hovering the same folder", () => {
            const mockScopedOtherItems = [
                new BlackListItemBuilder().withPath("/root/src/**/*.a").withType("flatten").build(),
                new BlackListItemBuilder().withPath("/root/src/**/*.b").withType("flatten").build()
            ]

            store.setState({
                ...initialState,
                fileSettings: {
                    ...initialState.fileSettings,
                    blacklist: mockScopedOtherItems
                }
            })
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, null)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show(OTHER_EXTENSION)

            expect(dispatchSpy).toHaveBeenCalledWith({
                items: mockScopedOtherItems,
                type: "REMOVE_BLACKLIST_ITEMS"
            })
        })

        it("should prioritize hovered scope over selected scope when showing extension with both nodes present", () => {
            const mockSelectedNode: CodeMapNode = {
                name: "components",
                path: "/root/components",
                type: NodeType.FOLDER,
                attributes: {},
                isExcluded: false,
                isFlattened: false,
                children: []
            }

            const hoveredScopedItem = new BlackListItemBuilder().withPath("/root/src/**/*.ts").withType("flatten").build()
            const selectedScopedItem = new BlackListItemBuilder().withPath("/root/components/**/*.ts").withType("flatten").build()

            store.setState({
                ...initialState,
                fileSettings: {
                    ...initialState.fileSettings,
                    blacklist: [hoveredScopedItem, selectedScopedItem]
                }
            })
            store.overrideSelector(hoveredNodeSelector, mockHoveredNode)
            store.overrideSelector(selectedNodeSelector, mockSelectedNode)
            store.refreshState()

            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show("ts")

            expect(dispatchSpy).toHaveBeenCalledWith({
                items: [hoveredScopedItem],
                type: "REMOVE_BLACKLIST_ITEMS"
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
                    isFlattened: false,
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
                    isExcluded: false,
                    isFlattened: false
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
                    isFlattened: false,
                    children: []
                }
                const result = buildGlobPatterns(OTHER_EXTENSION, mockDistribution, folderNode)
                expect(result).toEqual(["/root/src/**/*.a", "/root/src/**/*.b"])
            })
        })
    })
})
