import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { FileExtensionBarComponent } from "./fileExtensionBar.component"
import { metricDistributionSelector } from "./selectors/metricDistribution.selector"
import { CategorizedMetricDistribution } from "./selectors/fileExtensionCalculator"
import { BlacklistItem } from "../../codeCharta.model"
import { blacklistSelector } from "../../state/store/fileSettings/blacklist/blacklist.selector"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { areaMetricSelector } from "../../state/store/dynamicSettings/areaMetric/areaMetric.selector"

describe("fileExtensionBarComponent", () => {
    let fixture: ComponentFixture<FileExtensionBarComponent>
    let component: FileExtensionBarComponent

    const fileExtensionToTest = "ts"
    const relativeValue = "ts 100.00%"
    const absoluteValue = "ts 1,120"

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [FileExtensionBarComponent],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: {} },
                        { selector: accumulatedDataSelector, value: {} },
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
                        { selector: blacklistSelector, value: [] as BlacklistItem[] }
                    ]
                }),
                {
                    provide: ThreeSceneService,
                    useValue: {
                        applyClearHightlights: jest.fn(),
                        highlightBuildingsByExtension: jest.fn()
                    }
                }
            ]
        })
    }))

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
            expect(threeSceneService.applyClearHightlights).toHaveBeenCalled()
        })

        it("should highlight buildings on hover", async () => {
            await userEvent.hover(fileExtensionToHighlight)
            expect(threeSceneService.highlightBuildingsByExtension).toHaveBeenCalledWith(new Set([fileExtensionToTest]))
        })
    })
})
