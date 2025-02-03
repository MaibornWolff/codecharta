import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import stringify from "safe-stable-stringify"
import { MapColors } from "../../../codeCharta.model"
import { setMapColors } from "../../store/appSettings/mapColors/mapColors.actions"
import { defaultMapColors } from "../../store/appSettings/mapColors/mapColors.reducer"
import { colorMetricSelector } from "../../store/dynamicSettings/colorMetric/colorMetric.selector"
import { defaultState } from "../../store/state.manager"
import { UpdateMapColorsEffect } from "./updateMapColors.effect"
import { provideMockActions } from "@ngrx/effects/testing"
import { Observable, ReplaySubject, Subscription } from "rxjs"
import { Action } from "@ngrx/store"

describe("UpdateMapColorsEffect", () => {
    let actions$: ReplaySubject<Action>
    let effects: UpdateMapColorsEffect
    let store: MockStore
    let subscriptions: Subscription[]

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

    beforeEach(() => {
        actions$ = new ReplaySubject(1)
        subscriptions = []

        TestBed.configureTestingModule({
            providers: [
                UpdateMapColorsEffect,
                provideMockActions(() => actions$),
                { provide: State, useValue: { getValue: () => modifiedDefaultState } },
                provideMockStore({
                    initialState: modifiedDefaultState,
                    selectors: [
                        {
                            selector: colorMetricSelector,
                            value: "mcc"
                        }
                    ]
                })
            ]
        })

        effects = TestBed.inject(UpdateMapColorsEffect)
        store = TestBed.inject(MockStore)
    })

    afterEach(() => {
        subscriptions.forEach(sub => {
            sub.unsubscribe()
        })
        subscriptions = []
        store?.resetSelectors()
        actions$ = null
        effects = null
        store = null
        jest.clearAllMocks()
    })

    describe("updateMapColors$", () => {
        it("should reverse mapcolors when attributedescriptor has positive direction", done => {
            // Arrange
            const reversedMapColors: MapColors = JSON.parse(stringify(defaultMapColors))
            const temporary = reversedMapColors.negative
            reversedMapColors.negative = reversedMapColors.positive
            reversedMapColors.positive = temporary

            // Act
            store.overrideSelector(colorMetricSelector, "rloc")
            store.refreshState()

            // Assert
            subscriptions.push(
                effects.updateMapColors$.subscribe(action => {
                    expect(action).toEqual(setMapColors({ value: reversedMapColors }))
                    done()
                })
            )
        })

        it("should set mapcolors to default when attributedescriptor has negative direction", done => {
            // Act
            store.overrideSelector(colorMetricSelector, "comment_lines")
            store.refreshState()

            // Assert
            subscriptions.push(
                effects.updateMapColors$.subscribe(action => {
                    expect(action).toEqual(setMapColors({ value: defaultMapColors }))
                    done()
                })
            )
        })
    })
})
