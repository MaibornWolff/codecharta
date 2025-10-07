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

    it("should be created", () => {
        expect(component).toBeDefined()
    })

    it("should flatten extension when flatten button is clicked", async () => {
        const dispatchSpy = jest.spyOn(store, "dispatch")
        openContextMenu()

        const flattenButton = fixture.debugElement.query(By.css('[data-test-id="flattenBuilding"]'))
        flattenButton.nativeElement.click()

        expect(dispatchSpy).toHaveBeenCalledWith({
            action: { type: "flatten" },
            extensions: [addPrefixWildcard(mockItem.fileExtension)],
            type: "BlacklistExtensionAction"
        })
        updateStoreWithBlacklistedItems(store, { path: "*.ts", type: "flatten" })

        expect(fixture.componentInstance.isFlattened()).toBeTruthy()
    })

    describe("Visual Representation", () => {
        it("should display relative value correctly", () => {
            const titleEl = fixture.debugElement.query(By.css('[data-test-id="formattedTitle"]'))
            expect(titleEl.nativeElement.textContent).toEqual(` ${mockItem.fileExtension} ${mockItem.relativeMetricValue.toFixed(2)}% `)
        })

        it("should display absolute value when showAbsoluteValues is true", () => {
            fixture.componentRef.setInput("showAbsoluteValues", true)
            fixture.detectChanges()

            const titleEl = fixture.debugElement.query(By.css('[data-test-id="formattedTitle"]'))
            expect(titleEl.nativeElement.textContent).toEqual(` ${mockItem.fileExtension} ${mockItem.absoluteMetricValue} `)
        })

        it("should display 'no data available' when absoluteMetricValue is null", () => {
            const itemWithNullValue: MetricDistribution = {
                fileExtension: "ts",
                relativeMetricValue: 10,
                absoluteMetricValue: null,
                color: "#ffffff"
            }
            fixture.componentRef.setInput("item", itemWithNullValue)
            fixture.componentRef.setInput("showAbsoluteValues", true)
            fixture.detectChanges()

            const titleEl = fixture.debugElement.query(By.css('[data-test-id="formattedTitle"]'))
            expect(titleEl.nativeElement.textContent).toEqual(` No data available `)
        })

        it("should display 'no data available' when relativeMetricValue is null", () => {
            const itemWithNullValue: MetricDistribution = {
                fileExtension: "ts",
                relativeMetricValue: null,
                absoluteMetricValue: 10,
                color: "#ffffff"
            }
            fixture.componentRef.setInput("item", itemWithNullValue)
            fixture.componentRef.setInput("showAbsoluteValues", false)
            fixture.detectChanges()

            const titleEl = fixture.debugElement.query(By.css('[data-test-id="formattedTitle"]'))
            expect(titleEl.nativeElement.textContent).toEqual(` No data available `)
        })

        it("should display 'no data available' when absoluteMetricValue is undefined", () => {
            const itemWithUndefinedValue: MetricDistribution = {
                fileExtension: "ts",
                relativeMetricValue: 10,
                absoluteMetricValue: undefined,
                color: "#ffffff"
            }
            fixture.componentRef.setInput("item", itemWithUndefinedValue)
            fixture.componentRef.setInput("showAbsoluteValues", true)
            fixture.detectChanges()

            const titleEl = fixture.debugElement.query(By.css('[data-test-id="formattedTitle"]'))
            expect(titleEl.nativeElement.textContent).toEqual(` No data available `)
        })

        it("should have background color matching item color", () => {
            expect(fixture.componentInstance.backgroundColor).toEqual(mockItem.color)
        })

        it("should set flexGrow to match relative metric value", () => {
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

        it("should show context menu with flatten and exclude when extension is shown", async () => {
            openContextMenu()

            expect(screen.queryByText("Exclude")).toBeTruthy()
            expect(screen.queryByText("Show")).toBeFalsy()
            expect(screen.queryByText("Flatten")).toBeTruthy()
        })

        it("should show context menu with show and exclude when extension is flattened", async () => {
            updateStoreWithBlacklistedItems(store, itemToFlatten)
            openContextMenu()

            const flattenButton = fixture.debugElement.query(By.css('[data-test-id="showBuilding"]'))
            flattenButton.nativeElement.click()

            expect(screen.queryByText("Exclude")).toBeTruthy()
            expect(screen.queryByText("Show")).toBeTruthy()
            expect(screen.queryByText("Flatten")).toBeFalsy()
        })

        it("should update store and show extension when clicking on show", () => {
            updateStoreWithBlacklistedItems(store, itemToFlatten)

            openContextMenu()
            const flattenButton = fixture.debugElement.query(By.css('[data-test-id="showBuilding"]'))
            flattenButton.nativeElement.click()

            expect(dispatchSpy).toHaveBeenCalledWith({ items: [{ path: "*.ts", type: "flatten" }], type: "REMOVE_BLACKLIST_ITEMS" })

            updateStoreWithBlacklistedItems(store)
            openContextMenu()

            expect(screen.queryByText("Flatten")).toBeTruthy()
            expect(screen.queryByText("Exclude")).toBeTruthy()
        })

        it("should not show context menu when file extension is empty", async () => {
            const mockedDistribution: MetricDistribution = {
                fileExtension: NO_EXTENSION,
                color: "#ffffff",
                absoluteMetricValue: 10,
                relativeMetricValue: 1
            }
            fixture.componentRef.setInput("item", mockedDistribution)
            fixture.detectChanges()

            openContextMenu()

            expect(screen.queryByText("Flatten")).toBeFalsy()
            expect(screen.queryByText("Exclude")).toBeFalsy()
        })

        it("should show 'Show' instead of 'Flatten' when extension is already flattened", async () => {
            updateStoreWithBlacklistedItems(store, itemToFlatten)

            openContextMenu()

            expect(screen.queryByText("Show")).toBeTruthy()
            expect(screen.queryByText("Flatten")).toBeFalsy()
        })

        it.each<[string, BlacklistType]>([
            ["excludeBuilding", "exclude"],
            ["flattenBuilding", "flatten"]
        ])("should add all other extensions to blacklist when clicking %s on 'other'", (dataTestId, action) => {
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

            openContextMenu()

            const flattenButton = fixture.debugElement.query(By.css(`[data-test-id="${dataTestId}"]`))
            flattenButton.nativeElement.click()

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

        it("should highlight extension when segment is hovered", () => {
            const barSegment = fixture.debugElement.query(By.css('[class="cc-bar-section-text"]'))

            barSegment.triggerEventHandler("mouseover", null)

            expect(highlightBuildingsService.highlightExtension).toHaveBeenCalledWith(mockItem.fileExtension)
            expect(highlightBuildingsService.clearHighlightingOnFileExtensions).not.toHaveBeenCalled()
        })

        it("should clear highlighting when segment is unhovered", () => {
            const barSegment = fixture.debugElement.query(By.css('[class="cc-bar-section-text"]'))

            barSegment.triggerEventHandler("mouseleave", null)

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
