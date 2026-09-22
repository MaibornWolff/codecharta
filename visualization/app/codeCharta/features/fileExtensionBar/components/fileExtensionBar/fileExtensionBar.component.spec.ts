import { ComponentFixture, TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { provideMockState } from "../../../../mocks/state.mocks"
import { NodeRule } from "../../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../../renderer/renderModel/accumulatedData/accumulatedData.selector"
import { ThreeSceneService } from "../../../../renderer/threeViewer/threeViewer.facade"
import { areaMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { excludedNodesSelector, flattenedNodesSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { hoveredNodePathSelector } from "../../../../stores/sharedView/store/hoveredNodePath/hoveredNodePath.selector"
import { selectedNodePathSelector } from "../../../../stores/sharedView/store/selectedNodePath/selectedNodePath.selector"
import { CategorizedMetricDistribution } from "../../../../util/fileExtension/fileExtensionCalculator"
import { hoveredNodeMetricDistributionSelector } from "../../selectors/hoveredNodeMetricDistribution.selector"
import { metricDistributionSelector } from "../../selectors/metricDistribution.selector"
import { FileExtensionBarComponent } from "./fileExtensionBar.component"

describe("FileExtensionBarComponent", () => {
    let fixture: ComponentFixture<FileExtensionBarComponent>
    let component: FileExtensionBarComponent

    const fileExtensionToTest = "ts"
    const relativeValue = "ts 100.00%"
    const absoluteValue = "ts 1,120"

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FileExtensionBarComponent],
            providers: [
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: {} },
                        { selector: accumulatedDataSelector, value: {} },
                        { selector: hoveredNodePathSelector, value: null },
                        { selector: selectedNodePathSelector, value: null },
                        {
                            selector: metricDistributionSelector,
                            value: {
                                none: [],
                                visible: [
                                    {
                                        fileExtension: fileExtensionToTest,
                                        absoluteMetricValue: 1120,
                                        relativeMetricValue: 100,
                                        color: "hsl(111, 40%, 50%)"
                                    }
                                ],
                                others: []
                            } as CategorizedMetricDistribution
                        },
                        {
                            selector: hoveredNodeMetricDistributionSelector,
                            value: {
                                none: [],
                                visible: [
                                    {
                                        fileExtension: fileExtensionToTest,
                                        absoluteMetricValue: 1120,
                                        relativeMetricValue: 100,
                                        color: "hsl(111, 40%, 50%)"
                                    }
                                ],
                                others: []
                            } as CategorizedMetricDistribution
                        },
                        { selector: excludedNodesSelector, value: [] as NodeRule[] },
                        { selector: flattenedNodesSelector, value: [] as NodeRule[] }
                    ]
                }),
                {
                    provide: ThreeSceneService,
                    useValue: {
                        applyClearHighlights: jest.fn(),
                        highlightBuildingsByExtension: jest.fn()
                    }
                }
            ]
        })
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(FileExtensionBarComponent)
        component = fixture.componentInstance
        fixture.autoDetectChanges()
    })

    it("should be created", () => {
        expect(component).toBeDefined()
    })

    it("should show relative value by default", () => {
        expect(screen.getByText(relativeValue)).toBeTruthy()
        expect(screen.queryByText(absoluteValue)).toBeFalsy()
    })

    it("should toggle displayed metric relative / absolute values on click", async () => {
        await userEvent.click(screen.getByText(relativeValue))

        await waitFor(() => expect(screen.queryByText(relativeValue)).toBeFalsy())
        await waitFor(() => expect(screen.getByText(absoluteValue)).toBeTruthy())
    })

    describe("Hover", () => {
        let threeSceneService: ThreeSceneService
        let fileExtensionToHighlight: HTMLElement

        beforeEach(async () => {
            fileExtensionToHighlight = screen.getByText(relativeValue)
            threeSceneService = TestBed.inject<ThreeSceneService>(ThreeSceneService)
        })

        it("should unhighlight buildings when no longer hovered", async () => {
            await userEvent.hover(fileExtensionToHighlight)
            await userEvent.unhover(fileExtensionToHighlight)
            expect(threeSceneService.applyClearHighlights).toHaveBeenCalled()
        })

        it("should highlight buildings on hover", async () => {
            await userEvent.hover(fileExtensionToHighlight)
            expect(threeSceneService.highlightBuildingsByExtension).toHaveBeenCalledWith(new Set([fileExtensionToTest]))
        })
    })
})
