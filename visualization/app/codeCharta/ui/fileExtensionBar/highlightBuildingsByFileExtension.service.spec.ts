import { TestBed, waitForAsync } from "@angular/core/testing"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { HighlightBuildingsByFileExtensionService } from "./highlightBuildingsByFileExtension.service"
import { provideMockStore } from "@ngrx/store/testing"
import { metricDistributionSelector } from "./selectors/metricDistribution.selector"
import { CategorizedMetricDistribution, NO_EXTENSION, OTHER_EXTENSION } from "./selectors/fileExtensionCalculator"

describe("HighlightBuildingsByFileExtensionService", () => {
    let fixture: HighlightBuildingsByFileExtensionService
    let threeSceneServiceWithMockedMethods: ThreeSceneService
    const mockedDistribution: CategorizedMetricDistribution = {
        visible: [
            {
                fileExtension: "ts",
                relativeMetricValue: 0.31,
                absoluteMetricValue: 31,
                color: ""
            },
            {
                fileExtension: "java",
                relativeMetricValue: 0.35,
                absoluteMetricValue: 35,
                color: ""
            },
            {
                fileExtension: "other",
                relativeMetricValue: 0.3,
                absoluteMetricValue: 3,
                color: ""
            }
        ],
        others: [
            {
                fileExtension: "xml",
                relativeMetricValue: 0.1,
                absoluteMetricValue: 1,
                color: ""
            },
            {
                fileExtension: "json",
                relativeMetricValue: 0.2,
                absoluteMetricValue: 1,
                color: ""
            }
        ],
        none: [
            {
                fileExtension: NO_EXTENSION,
                relativeMetricValue: 0.2,
                absoluteMetricValue: 1,
                color: ""
            }
        ]
    }
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                HighlightBuildingsByFileExtensionService,
                {
                    provide: ThreeSceneService,
                    useValue: {
                        highlightBuildingsByExtension: jest.fn(),
                        applyClearHightlights: jest.fn(),
                        highlightBuildingsWithoutExtensions: jest.fn()
                    }
                },
                provideMockStore({
                    selectors: [
                        {
                            selector: metricDistributionSelector,
                            value: mockedDistribution
                        }
                    ]
                })
            ]
        })
    }))

    beforeEach(() => {
        fixture = TestBed.inject(HighlightBuildingsByFileExtensionService)
        threeSceneServiceWithMockedMethods = TestBed.inject(ThreeSceneService)
    })

    afterEach(() => {
        jest.fn().mockClear()
    })

    it("Service can be initiated", () => {
        expect(fixture).toBeTruthy()
    })

    it("Highlighting an extension will highlight all the buildings with a this extension", () => {
        fixture.highlightExtension("ts")
        expect(threeSceneServiceWithMockedMethods.highlightBuildingsByExtension).toHaveBeenCalledWith(new Set(["ts"]))
    })

    it(`Highlighting ${OTHER_EXTENSION} will highlight all the buildings grouped in ${OTHER_EXTENSION}`, () => {
        fixture.highlightExtension(OTHER_EXTENSION)
        expect(threeSceneServiceWithMockedMethods.highlightBuildingsByExtension).toHaveBeenCalledWith(new Set(["xml", "json"]))
    })

    it(`Highlighting ${NO_EXTENSION} will highlight all the buildings grouped in ${NO_EXTENSION}`, () => {
        fixture.highlightExtension(NO_EXTENSION)
        expect(threeSceneServiceWithMockedMethods.highlightBuildingsWithoutExtensions).toHaveBeenCalledWith()
    })

    it("Clear highlighting will call the 3sceneService to clear all the highlighting", () => {
        fixture.clearHighlightingOnFileExtensions()
        expect(threeSceneServiceWithMockedMethods.applyClearHightlights).toHaveBeenCalledTimes(1)
    })
})
