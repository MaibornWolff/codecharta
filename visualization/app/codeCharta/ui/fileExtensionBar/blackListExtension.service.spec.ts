import { TestBed, waitForAsync } from "@angular/core/testing"

import { addPrefixWildcard, BlackListExtensionService } from "./blackListExtension.service"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { CategorizedMetricDistribution, OTHER_EXTENSION } from "./selectors/fileExtensionCalculator"
import { BlacklistItem, BlacklistType, CcState, ColorMode, NodeType, SortingOption } from "../../codeCharta.model"
import { hoveredNodeMetricDistributionSelector } from "./selectors/hoveredNodeMetricDistribution.selector"
import { BlacklistExtensionAction } from "../../state/effects/blacklistExtension/blacklistExtension.effect"

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

describe("BlackListServiceService", () => {
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
        it(`WHEN ${actionType} an extension THEN the store is called with an action to ${actionType} the extension with a wildcard as prefix.`, () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture[actionType]("ts")

            const expectedAction: BlacklistExtensionAction = {
                action: { type: actionType },
                extensions: ["*.ts"],
                type: "BlacklistExtensionAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })

        it(`WHEN ${actionType} other extensions THEN the store is called with an action to ${actionType} the other extensions with a wildcard as prefix.`, () => {
            // WHEN
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture[actionType](OTHER_EXTENSION)

            // THEN
            const expectedAction: BlacklistExtensionAction = {
                action: { type: actionType },
                extensions: mockDistribution.others.map(it => addPrefixWildcard(it.fileExtension)),
                type: "BlacklistExtensionAction"
            }
            expect(dispatchSpy).toHaveBeenCalledWith(expectedAction)
        })
    })

    describe("Show extensions", () => {
        it("GIVEN an extension is flattened WHEN showing it again THEN the store is called with a remove action", () => {
            // WHEN
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show("ts")

            // THEN
            expect(dispatchSpy).toHaveBeenCalledWith({
                item: mockFlattenedTypescriptItem,
                type: "REMOVE_BLACKLIST_ITEM"
            })
        })
        it("GIVEN other extensions are hidden WHEN showing other extensions again THEN the store is called with a remove action for all the other items.", () => {
            // WHEN
            const dispatchSpy = jest.spyOn(store, "dispatch")
            fixture.show(OTHER_EXTENSION)

            // THEN
            expect(dispatchSpy).toHaveBeenCalledWith({
                items: mockFlattenedOtherItems,
                type: "REMOVE_BLACKLIST_ITEMS"
            })
        })
    })
})
