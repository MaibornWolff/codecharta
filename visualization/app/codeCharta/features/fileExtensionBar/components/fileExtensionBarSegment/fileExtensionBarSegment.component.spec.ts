import { ComponentFixture, TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { screen } from "@testing-library/angular"
import { CcState, NodeRule, RadialFolderStyle, RadialFolderValue, RuleEffect, SortingOption } from "../../../../model/codeCharta.model"
import { ThreeSceneService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { defaultMapState } from "../../../../stores/mapState/mapState.read.facade"
import { defaultDependencyGraphSettings } from "../../../../stores/preferences/preferences.read.facade"
import { sortedFlattenedNodesSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { CategorizedMetricDistribution, MetricDistribution, NO_EXTENSION } from "../../../../util/fileExtension/fileExtensionCalculator"
import { hoveredNodeMetricDistributionSelector } from "../../selectors/hoveredNodeMetricDistribution.selector"
import { metricDistributionSelector } from "../../selectors/metricDistribution.selector"
import { addPrefixWildcard, ExtensionRulesService } from "../../services/extensionRules.service"
import { HighlightBuildingsByFileExtensionService } from "../../services/highlightBuildingsByFileExtension.service"
import { FileExtensionBarSegmentComponent } from "./fileExtensionBarSegment.component"

describe("FileExtensionBarSegment", () => {
    let fixture: ComponentFixture<FileExtensionBarSegmentComponent>
    let component: FileExtensionBarSegmentComponent
    let store: MockStore
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
            screenshotToClipboardEnabled: false,
            localSourceEnabled: false,
            isColorMetricLinkedToHeightMetric: false,
            sorting: { option: SortingOption.NAME, orderAscending: true },
            radialFolderValue: RadialFolderValue.Max,
            radialFolderStyle: RadialFolderStyle.Tinted,
            radialFolderTint: 0.5,
            radialLevels: 3,
            dependencyGraph: defaultDependencyGraphSettings
        },
        sharedView: {
            focusedNodePath: [],
            searchPattern: "",
            excludedNodes: [],
            flattenedNodes: [],
            metricRules: [],
            markedPackages: [],
            hoveredNodePath: null,
            hoveredFileExtensions: [],
            keptHighlightPaths: [],
            selectedNodePath: null,
            rightClickedNodeData: null
        }
    }
    const mockItem: MetricDistribution = {
        fileExtension: "ts",
        relativeMetricValue: 10,
        absoluteMetricValue: 1,
        color: "#ffffff"
    }

    beforeEach(() => {
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
                ExtensionRulesService,
                { provide: ThreeSceneService, useValue: {} },
                provideMockStore({ initialState })
            ]
        })
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(FileExtensionBarSegmentComponent)
        component = fixture.componentInstance
        store = TestBed.inject(MockStore)

        fixture.componentRef.setInput("item", mockItem)
        fixture.componentRef.setInput("showAbsoluteValues", false)
        document.body.appendChild(fixture.nativeElement)
        fixture.autoDetectChanges()
    })

    afterEach(() => {
        fixture.destroy()
        fixture.nativeElement.remove()
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
            action: { effect: "flatten" },
            extensions: [addPrefixWildcard(mockItem.fileExtension)],
            type: "ExtensionRuleAction"
        })
        updateStoreWithFlattenedNodes(store, { path: "*.ts" })
        openContextMenu()

        expect(screen.queryByText("Show")).toBeTruthy()
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
        let dispatchSpy: jest.SpyInstance

        beforeEach(() => {
            dispatchSpy = jest.spyOn(store, "dispatch")
        })

        const itemToFlatten: NodeRule = {
            path: "*.ts"
        }

        it("should show context menu with flatten and exclude when extension is shown", async () => {
            openContextMenu()

            expect(screen.queryByText("Exclude")).toBeTruthy()
            expect(screen.queryByText("Show")).toBeFalsy()
            expect(screen.queryByText("Flatten")).toBeTruthy()
        })

        it("should show context menu with show and exclude when extension is flattened", async () => {
            updateStoreWithFlattenedNodes(store, itemToFlatten)
            openContextMenu()

            expect(screen.queryByText("Exclude")).toBeTruthy()
            expect(screen.queryByText("Show")).toBeTruthy()
            expect(screen.queryByText("Flatten")).toBeFalsy()
        })

        it("should close the context menu after clicking an action", () => {
            openContextMenu()
            expect(screen.queryByText("Exclude")).toBeTruthy()

            const excludeButton = fixture.debugElement.query(By.css('[data-test-id="excludeBuilding"]'))
            excludeButton.nativeElement.click()
            fixture.detectChanges()

            expect(screen.queryByText("Exclude")).toBeFalsy()
        })

        it("should update store and show extension when clicking on show", () => {
            updateStoreWithFlattenedNodes(store, itemToFlatten)

            openContextMenu()
            const flattenButton = fixture.debugElement.query(By.css('[data-test-id="showBuilding"]'))
            flattenButton.nativeElement.click()

            expect(dispatchSpy).toHaveBeenCalledWith({ items: [{ path: "*.ts" }], type: "REMOVE_FLATTENED_NODES" })

            updateStoreWithFlattenedNodes(store)
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
            updateStoreWithFlattenedNodes(store, itemToFlatten)

            openContextMenu()

            expect(screen.queryByText("Show")).toBeTruthy()
            expect(screen.queryByText("Flatten")).toBeFalsy()
        })

        it.each<[string, RuleEffect]>([
            ["excludeBuilding", "exclude"],
            ["flattenBuilding", "flatten"]
        ])("should add a rule for all other extensions when clicking %s on 'other'", (dataTestId, action) => {
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
                action: { effect: action },
                extensions: otherFileExtensionsWithWildcards,
                type: "ExtensionRuleAction"
            })
        })
    })

    describe("Hovering behavior", () => {
        let highlightBuildingsService: HighlightBuildingsByFileExtensionService
        beforeEach(() => {
            highlightBuildingsService = TestBed.inject(HighlightBuildingsByFileExtensionService)
        })

        it("should highlight extension when segment is hovered", () => {
            const barSegment = fixture.debugElement.query(By.css(".cc-bar-section-text"))

            barSegment.triggerEventHandler("mouseover", null)

            expect(highlightBuildingsService.highlightExtension).toHaveBeenCalledWith(mockItem.fileExtension)
            expect(highlightBuildingsService.clearHighlightingOnFileExtensions).not.toHaveBeenCalled()
        })

        it("should clear highlighting when segment is unhovered", () => {
            const barSegment = fixture.debugElement.query(By.css(".cc-bar-section-text"))

            barSegment.triggerEventHandler("mouseleave", null)

            expect(highlightBuildingsService.clearHighlightingOnFileExtensions).toHaveBeenCalled()
            expect(highlightBuildingsService.highlightExtension).not.toHaveBeenCalled()
        })
    })

    describe("Others list", () => {
        const otherItem: MetricDistribution = { fileExtension: "other", relativeMetricValue: 4, absoluteMetricValue: 40, color: "#676867" }
        const others: MetricDistribution[] = [
            { fileExtension: "yml", relativeMetricValue: 2.5, absoluteMetricValue: 25, color: "#111111" },
            { fileExtension: "sh", relativeMetricValue: 1.5, absoluteMetricValue: 15, color: "#222222" }
        ]

        function othersList() {
            return document.querySelector('[data-test-id="othersList"]')
        }

        function hoverSegment() {
            fixture.nativeElement.dispatchEvent(new MouseEvent("mouseenter"))
            fixture.detectChanges()
        }

        function leaveSegment() {
            fixture.nativeElement.dispatchEvent(new MouseEvent("mouseleave"))
            fixture.detectChanges()
        }

        beforeEach(() => {
            fixture.componentRef.setInput("item", otherItem)
            fixture.componentRef.setInput("others", others)
            fixture.detectChanges()
        })

        it("should list the extensions of others while the segment is hovered", () => {
            // Arrange & Act
            hoverSegment()

            // Assert
            expect(othersList().textContent).toContain("yml 2.50%")
            expect(othersList().textContent).toContain("sh 1.50%")
        })

        it("should hide the list when the pointer leaves the segment", () => {
            // Arrange
            hoverSegment()

            // Act
            leaveSegment()

            // Assert
            expect(othersList()).toBeNull()
        })

        it("should not open a list for a segment other than others", () => {
            // Arrange
            fixture.componentRef.setInput("item", mockItem)

            // Act
            hoverSegment()

            // Assert
            expect(othersList()).toBeNull()
        })

        it("should hide the list while the menu of the others segment is open", () => {
            // Arrange
            hoverSegment()

            // Act
            openContextMenu()

            // Assert
            expect(othersList()).toBeNull()
            expect(screen.queryByText("Exclude")).toBeTruthy()
        })

        it("should keep the list open while the menu of one of its rows is open", () => {
            // Arrange
            hoverSegment()
            const firstRow = othersList().querySelector('[data-test-id="otherExtension"]')

            // Act
            firstRow.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }))
            fixture.detectChanges()
            leaveSegment()

            // Assert
            expect(othersList()).toBeTruthy()
            expect(screen.queryByText("Exclude")).toBeTruthy()
        })

        it("should flatten only the right-clicked extension of others", () => {
            // Arrange
            const dispatchSpy = jest.spyOn(store, "dispatch")
            hoverSegment()
            const secondRow = othersList().querySelectorAll('[data-test-id="otherExtension"]')[1]
            secondRow.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }))
            fixture.detectChanges()

            // Act
            screen.getByText("Flatten").click()
            fixture.detectChanges()

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith({
                action: { effect: "flatten" },
                extensions: [addPrefixWildcard("sh")],
                type: "ExtensionRuleAction"
            })
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

function updateStoreWithFlattenedNodes(mockStore: MockStore, ...flattenedNodes: NodeRule[]) {
    mockStore.overrideSelector(sortedFlattenedNodesSelector, flattenedNodes)
    mockStore.refreshState()
}
