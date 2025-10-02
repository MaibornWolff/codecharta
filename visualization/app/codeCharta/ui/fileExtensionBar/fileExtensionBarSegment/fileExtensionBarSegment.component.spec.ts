import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing"
import { FileExtensionBarSegmentComponent } from "./fileExtensionBarSegment.component"
import { addPrefixWildcard, BlackListExtensionService } from "../blackListExtension.service"
import { HighlightBuildingsByFileExtensionService } from "../highlightBuildingsByFileExtension.service"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { CategorizedMetricDistribution, MetricDistribution, NO_EXTENSION } from "../selectors/fileExtensionCalculator"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"
import { BlacklistItem, BlacklistType, CcState, ColorMode, SortingOption } from "../../../codeCharta.model"
import { By } from "@angular/platform-browser"
import { screen } from "@testing-library/angular"
import { metricDistributionSelector } from "../selectors/metricDistribution.selector"
import { hoveredNodeMetricDistributionSelector } from "../selectors/hoveredNodeMetricDistribution.selector"
import { Action } from "@ngrx/store"

describe("FileExtensionBarSegment", () => {
    let fixture: ComponentFixture<FileExtensionBarSegmentComponent>
    let component: FileExtensionBarSegmentComponent
    let store: MockStore
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
            blacklist: [],
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
    const mockItem: MetricDistribution = {
        fileExtension: "ts",
        relativeMetricValue: 10,
        absoluteMetricValue: 1,
        color: "#ffffff"
    }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [FileExtensionBarSegmentComponent],
            providers: [
                {
                    provide: HighlightBuildingsByFileExtensionService,
                    useValue: {
                        highlightExtension: jest.fn(),
                        clearHighlightingOnFileExtensions: jest.fn()
                    }
                },
                BlackListExtensionService,
                { provide: ThreeSceneService, useValue: {} },
                provideMockStore({ initialState })
            ]
        })
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(FileExtensionBarSegmentComponent)
        component = fixture.componentInstance
        store = TestBed.inject(MockStore)

        fixture.componentRef.setInput("item", mockItem)
        fixture.componentRef.setInput("showAbsoluteValues", false)
        fixture.autoDetectChanges()
    })

    afterEach(() => {
        store.resetSelectors()
        jest.restoreAllMocks()
    })

    it("INITIAL test setup allows the component to be created.", () => {
        expect(component).toBeDefined()
    })

    it("GIVEN a building is flattened THEN the extension is flattened", async () => {
        // GIVEN
        const dispatchSpy = jest.spyOn(store, "dispatch")
        openContextMenu()

        // WHEN
        const flattenButton = fixture.debugElement.query(By.css('[data-test-id="flattenBuilding"]'))
        flattenButton.nativeElement.click()

        // THEN
        expect(dispatchSpy).toHaveBeenCalledWith({
            action: { type: "flatten" },
            extensions: [addPrefixWildcard(mockItem.fileExtension)],
            type: "BlacklistExtensionAction"
        })
        updateStoreWithBlacklistedItems(store, { path: "*.ts", type: "flatten" })

        expect(fixture.componentInstance.isFlattened()).toBeTruthy()
    })

    describe("Visual Representation", () => {
        it("GIVEN the relative values should be shown THEN the relative value of the item is displayed corrected", () => {
            // THEN
            const titleEl = fixture.debugElement.query(By.css('[data-test-id="formattedTitle"]'))
            expect(titleEl.nativeElement.textContent).toEqual(` ${mockItem.fileExtension} ${mockItem.relativeMetricValue.toFixed(2)}% `)
        })

        it("GIVEN the absolute values should be shown THEN the absolute values of the item are displayed.", () => {
            // GIVEN
            fixture.componentRef.setInput("showAbsoluteValues", true)
            fixture.detectChanges()

            // THEN
            const titleEl = fixture.debugElement.query(By.css('[data-test-id="formattedTitle"]'))
            expect(titleEl.nativeElement.textContent).toEqual(` ${mockItem.fileExtension} ${mockItem.absoluteMetricValue} `)
        })

        it("Background color is the same as the input items color.", () => {
            expect(fixture.componentInstance.backgroundColor).toEqual(mockItem.color)
        })

        it("The component should always try to grow as much as the relative value of the item.", () => {
            expect(fixture.componentInstance.flexGrow).toEqual(mockItem.relativeMetricValue)
        })
    })

    describe("Context Menu", () => {
        let dispatchSpy: jest.SpyInstance<void, [action: Action]>

        beforeEach(() => {
            dispatchSpy = jest.spyOn(store, "dispatch")
        })

        const itemToFlatten: BlacklistItem = {
            path: "*.ts",
            type: "flatten"
        }

        it("GIVEN the extension is currently shown WHEN the bar is rightclicked THEN the context menu is shown with flatten and exclude.", async () => {
            // WHEN
            openContextMenu()

            // THEN
            expect(screen.queryByText("Exclude")).toBeTruthy()
            expect(screen.queryByText("Show")).toBeFalsy()
            expect(screen.queryByText("Flatten")).toBeTruthy()
        })

        it("GIVEN the extension is currently flattened WHEN the bar is rightclicked THEN the context menu is shown with show and exclude.", async () => {
            // GIVEN
            updateStoreWithBlacklistedItems(store, itemToFlatten)
            openContextMenu()

            // WHEN
            const flattenButton = fixture.debugElement.query(By.css('[data-test-id="showBuilding"]'))
            flattenButton.nativeElement.click()

            // THEN
            expect(screen.queryByText("Exclude")).toBeTruthy()
            expect(screen.queryByText("Show")).toBeTruthy()
            expect(screen.queryByText("Flatten")).toBeFalsy()
        })

        it("WHEN clicking on show THEN the store updates and extension is shown again.", () => {
            // GIVEN
            updateStoreWithBlacklistedItems(store, itemToFlatten)

            // WHEN
            openContextMenu()
            const flattenButton = fixture.debugElement.query(By.css('[data-test-id="showBuilding"]'))
            flattenButton.nativeElement.click()

            // THEN
            expect(dispatchSpy).toHaveBeenCalledWith({ item: { path: "*.ts", type: "flatten" }, type: "REMOVE_BLACKLIST_ITEM" })

            updateStoreWithBlacklistedItems(store)
            openContextMenu()

            expect(screen.queryByText("Flatten")).toBeTruthy()
            expect(screen.queryByText("Exclude")).toBeTruthy()
        })

        it("GIVEN the component with no file extension is right clicked, THEN no context menu is shown.", async () => {
            // GIVEN
            const mockedDistribution: MetricDistribution = {
                fileExtension: NO_EXTENSION,
                color: "#ffffff",
                absoluteMetricValue: 10,
                relativeMetricValue: 1
            }
            fixture.componentRef.setInput("item", mockedDistribution)
            fixture.detectChanges()

            // WHEN
            openContextMenu()

            // THEN
            expect(screen.queryByText("Flatten")).toBeFalsy()
            expect(screen.queryByText("Exclude")).toBeFalsy()
        })

        it("GIVEN an extension is already flattened, THEN the show functionality is shown instead of flatten.", async () => {
            // GIVEN
            updateStoreWithBlacklistedItems(store, itemToFlatten)

            // WHEN
            openContextMenu()

            // THEN
            expect(screen.queryByText("Show")).toBeTruthy()
            expect(screen.queryByText("Flatten")).toBeFalsy()
        })

        it.each<[string, BlacklistType]>([
            ["excludeBuilding", "exclude"],
            ["flattenBuilding", "flatten"]
        ])("GIVEN %s is clicked on other THEN the store adds all the other blacklist items ", (dataTestId, action) => {
            // GIVEN
            const mockedDistribution: CategorizedMetricDistribution = {
                visible: [
                    {
                        fileExtension: "other",
                        color: "#ffffff",
                        relativeMetricValue: 10,
                        absoluteMetricValue: 1
                    }
                ],
                others: [
                    {
                        fileExtension: "csharp",
                        color: "#ffffff",
                        relativeMetricValue: 10,
                        absoluteMetricValue: 1
                    },
                    {
                        fileExtension: "java",
                        color: "#ffffff",
                        relativeMetricValue: 10,
                        absoluteMetricValue: 1
                    }
                ],
                none: []
            }

            const otherFileExtensionsWithWildcards = mockedDistribution.others.map(it => addPrefixWildcard(it.fileExtension))

            store.overrideSelector(metricDistributionSelector, mockedDistribution)
            store.overrideSelector(hoveredNodeMetricDistributionSelector, mockedDistribution)
            store.refreshState()

            fixture.componentRef.setInput("item", {
                fileExtension: "other",
                color: "#ffffff",
                relativeMetricValue: 10,
                absoluteMetricValue: 1
            } satisfies MetricDistribution)

            // WHEN
            openContextMenu()

            const flattenButton = fixture.debugElement.query(By.css(`[data-test-id="${dataTestId}"]`))
            flattenButton.nativeElement.click()

            // THEN
            expect(dispatchSpy).toHaveBeenCalledWith({
                action: { type: action },
                extensions: otherFileExtensionsWithWildcards,
                type: "BlacklistExtensionAction"
            })
        })
    })

    describe("Hovering behavior", () => {
        let highlightBuildingsService: HighlightBuildingsByFileExtensionService
        beforeEach(() => {
            highlightBuildingsService = TestBed.inject(HighlightBuildingsByFileExtensionService)
        })

        it("WHEN a segment is hovered THEN the extension is highlighted", () => {
            // GIVEN
            const barSegment = fixture.debugElement.query(By.css('[class="cc-bar-section-text"]'))

            // WHEN
            barSegment.triggerEventHandler("mouseover", null)

            // THEN
            expect(highlightBuildingsService.highlightExtension).toHaveBeenCalledWith(mockItem.fileExtension)
            expect(highlightBuildingsService.clearHighlightingOnFileExtensions).not.toHaveBeenCalled()
        })

        it("WHEN segment is unhovered THEN it clears the highlighting on the buildings.", () => {
            // GIVEN
            const barSegment = fixture.debugElement.query(By.css('[class="cc-bar-section-text"]'))

            // WHEN
            barSegment.triggerEventHandler("mouseleave", null)

            // THEN
            expect(highlightBuildingsService.clearHighlightingOnFileExtensions).toHaveBeenCalled()
            expect(highlightBuildingsService.highlightExtension).not.toHaveBeenCalled()
        })
    })

    function openContextMenu() {
        const barSegment = fixture.debugElement.query(By.css('[class="cc-bar-section"]'))
        const rightClickEvent = new MouseEvent("contextmenu", {
            bubbles: true
        })

        barSegment.nativeElement.dispatchEvent(rightClickEvent)
        fixture.detectChanges()
    }
})

function updateStoreWithBlacklistedItems(mockStore: MockStore, ...blackListItems: BlacklistItem[]) {
    mockStore.overrideSelector(blacklistSelector, blackListItems)
    mockStore.refreshState()
}
