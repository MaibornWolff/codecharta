import { TestBed } from "@angular/core/testing"
import { State, StoreModule } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"

import { EffectsModule } from "@ngrx/effects"
import stringify from "safe-stable-stringify"
import { MapColors } from "../../../codeCharta.model"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { setMapColors } from "../../store/appSettings/mapColors/mapColors.actions"
import { defaultMapColors } from "../../store/appSettings/mapColors/mapColors.reducer"
import { colorMetricSelector } from "../../store/dynamicSettings/colorMetric/colorMetric.selector"
import { appReducers, defaultState, setStateMiddleware } from "../../store/state.manager"
import { UpdateMapColorsEffect } from "./updateMapColors.effect"

describe("UpdateMapColorsEffect", () => {
    const modifiedDefaultState = {
        ...defaultState,
        fileSettings: {
            ...defaultState.fileSettings,
            attributeDescriptors: {
                comment_lines: {
                    title: "Comment Lines",
                    description: "Number of lines containing either a comment or commented-out code",
                    hintLowValue: "",
                    hintHighValue: "",
                    link: "https://www.npmjs.com/package/metric-gardener",
                    direction: -1
                },
                rloc: {
                    title: "Real Lines of Code",
                    description:
                        "Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment",
                    hintLowValue: "",
                    hintHighValue: "",
                    link: "https://www.npmjs.com/package/metric-gardener",
                    direction: 1
                }
            }
        }
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                EffectsModule.forRoot([UpdateMapColorsEffect]),
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })
            ],
            providers: [
                { provide: State, useValue: { getValue: () => modifiedDefaultState } },
                provideMockStore({
                    selectors: [
                        {
                            selector: colorMetricSelector,
                            value: "mcc"
                        }
                    ]
                })
            ]
        })
    })

    it("should reverse mapcolors when attributedescriptor of color metric has positive direction", async () => {
        const store = TestBed.inject(MockStore)
        store.overrideSelector(colorMetricSelector, "rloc")
        store.refreshState()

        const reversedMapColors: MapColors = JSON.parse(stringify(defaultMapColors))
        const temporary = reversedMapColors.negative
        reversedMapColors.negative = reversedMapColors.positive
        reversedMapColors.positive = temporary

        expect(await getLastAction(store)).toEqual(
            setMapColors({
                value: reversedMapColors
            })
        )
    })

    it("should set mapcolors to default when attributedescriptor of color metric has negative direction", async () => {
        const store = TestBed.inject(MockStore)
        store.overrideSelector(colorMetricSelector, "comment_lines")
        store.refreshState()

        expect(await getLastAction(store)).toEqual(
            setMapColors({
                value: defaultMapColors
            })
        )
    })
})
