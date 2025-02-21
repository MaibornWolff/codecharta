import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { CcState } from "app/codeCharta/codeCharta.model"
import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { State, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../store/state.manager"
import { colorLabelsSelector } from "../../store/appSettings/colorLabels/colorLabels.selector"
import { showMetricLabelNodeValueSelector } from "../../store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.selector"
import { showMetricLabelNodeNameSelector } from "../../store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.selector"
import { setShowMetricLabelNameValue } from "../../store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "../../store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { UpdateShowLabelsEffect } from "./updateShowLabels.effect"

describe("UpdateShowLabelsEffect", () => {
    let store: MockStore<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                EffectsModule.forRoot([UpdateShowLabelsEffect]),
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })
            ],
            providers: [
                provideMockStore({
                    selectors: [
                        {
                            selector: colorLabelsSelector,
                            value: { positive: false, negative: false, neutral: false }
                        },
                        {
                            selector: showMetricLabelNodeValueSelector,
                            value: false
                        },
                        {
                            selector: showMetricLabelNodeNameSelector,
                            value: false
                        }
                    ]
                }),
                {
                    provide: State,
                    useValue: {
                        getValue: () => ({ appSettings: { amountOfTopLabels: 5 } })
                    }
                }
            ]
        })
        store = TestBed.inject(MockStore)
    })

    it("should not dispatch any action when no color label is checked and showMetricLabelNameValue and showMetricLabelNodeName is false", async () => {
        store.refreshState()

        expect(await getLastAction(store)).toEqual({ type: "@ngrx/effects/init" })
    })

    it("should not dispatch any action when color label is checked and showMetricLabelNameValue and showMetricLabelNodeName is true", async () => {
        store.overrideSelector(colorLabelsSelector, { positive: true, negative: false, neutral: false })
        store.overrideSelector(showMetricLabelNodeValueSelector, true)
        store.overrideSelector(showMetricLabelNodeNameSelector, true)
        store.refreshState()

        expect(await getLastAction(store)).toEqual({ type: "@ngrx/effects/init" })
    })

    it("should set showMetricLabelNodeName to true when at least one color label is checked", async () => {
        store.overrideSelector(colorLabelsSelector, { positive: true, negative: false, neutral: false })
        store.refreshState()

        expect(await getLastAction(store)).toEqual(setShowMetricLabelNodeName({ value: true }))
    })

    it("should set showMetricLabelNameValue to false when no color label is checked", async () => {
        store.overrideSelector(colorLabelsSelector, { positive: false, negative: false, neutral: false })
        store.overrideSelector(showMetricLabelNodeValueSelector, true)
        store.refreshState()

        expect(await getLastAction(store)).toEqual(setShowMetricLabelNameValue({ value: false }))
    })
})
