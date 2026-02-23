import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { UpdateVisibleTopLabelsEffect } from "./updateVisibleTopLabels.effect"
import { CcState } from "app/codeCharta/codeCharta.model"
import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { State, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../store/state.manager"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates/visibleFileStates.selector"
import { codeMapNodesSelector } from "../../selectors/accumulatedData/codeMapNodes.selector"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"

describe("updateVisibleTopLabelsEffect", () => {
    let store: MockStore<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                EffectsModule.forRoot([UpdateVisibleTopLabelsEffect]),
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })
            ],
            providers: [
                provideMockStore({
                    selectors: [
                        {
                            selector: visibleFileStatesSelector,
                            value: []
                        },
                        {
                            selector: codeMapNodesSelector,
                            value: [
                                {
                                    name: "sample1.ts"
                                },
                                {
                                    name: "sample2.ts"
                                }
                            ]
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

    it("should set amount of top labels to current app-settings when visible file-states are unchanged", async () => {
        const visibleFileStates = []

        store.overrideSelector(visibleFileStatesSelector, visibleFileStates as ReturnType<typeof visibleFileStatesSelector>)
        store.refreshState()

        expect(await getLastAction(store)).toEqual(setAmountOfTopLabels({ value: 5 }))
    })

    it("should use auto-calculated amount when stored value is higher than auto-calc", async () => {
        const visibleFileStates = [
            {
                file: {
                    fileMeta: {
                        fileName: "sample1.cc.json"
                    }
                }
            }
        ]

        store.overrideSelector(visibleFileStatesSelector, visibleFileStates as ReturnType<typeof visibleFileStatesSelector>)
        store.refreshState()

        // stored value is 5, auto-calc for 2 nodes is 1 (default), so min(5, 1) = 1
        expect(await getLastAction(store)).toEqual(setAmountOfTopLabels({ value: 1 }))
    })

    it("should use auto-calculated amount when stored value is higher and map has many nodes", async () => {
        const visibleFileStates = [{ file: { fileMeta: { fileName: "large.cc.json" } } }]
        const manyNodes = Array.from({ length: 200 }, (_, i) => ({ name: `node${i}.ts` }))

        store.overrideSelector(visibleFileStatesSelector, visibleFileStates as ReturnType<typeof visibleFileStatesSelector>)
        store.overrideSelector(codeMapNodesSelector, manyNodes as ReturnType<typeof codeMapNodesSelector>)
        store.refreshState()

        // stored value is 5, auto-calc for 200 nodes is 2, so min(5, 2) = 2
        expect(await getLastAction(store)).toEqual(setAmountOfTopLabels({ value: 2 }))
    })
})

describe("updateVisibleTopLabelsEffect when stored value is lower than auto-calc", () => {
    let store: MockStore<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                EffectsModule.forRoot([UpdateVisibleTopLabelsEffect]),
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })
            ],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: visibleFileStatesSelector, value: [] },
                        {
                            selector: codeMapNodesSelector,
                            value: Array.from({ length: 300 }, (_, i) => ({ name: `node${i}.ts` }))
                        }
                    ]
                }),
                {
                    provide: State,
                    useValue: {
                        getValue: () => ({ appSettings: { amountOfTopLabels: 1 } })
                    }
                }
            ]
        })
        store = TestBed.inject(MockStore)
    })

    it("should preserve stored value when it is lower than auto-calculated amount", async () => {
        const visibleFileStates = [{ file: { fileMeta: { fileName: "large.cc.json" } } }]

        store.overrideSelector(visibleFileStatesSelector, visibleFileStates as ReturnType<typeof visibleFileStatesSelector>)
        store.refreshState()

        // stored value is 1, auto-calc for 300 nodes is 3, so min(1, 3) = 1
        expect(await getLastAction(store)).toEqual(setAmountOfTopLabels({ value: 1 }))
    })
})
