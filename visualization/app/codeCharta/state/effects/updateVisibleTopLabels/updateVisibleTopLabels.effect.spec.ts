import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { UpdateVisibleTopLabelsEffect } from "./updateVisibleTopLabels.effect"
import { CcState } from "app/codeCharta/codeCharta.model"
import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { State, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../store/state.manager"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { codeMapNodesSelector } from "../../selectors/accumulatedData/codeMapNodes.selector"
import { getLastAction } from "../../../../codeCharta/util/testUtils/store.utils"
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
							value: {}
						},
						{
							selector: codeMapNodesSelector,
							value: {}
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
		const visibleFileStates = {}
		const codeMapNodes = {}

		store.overrideSelector(visibleFileStatesSelector, visibleFileStates as ReturnType<typeof visibleFileStatesSelector>)
		store.overrideSelector(codeMapNodesSelector, codeMapNodes as ReturnType<typeof codeMapNodesSelector>)
		store.refreshState()

		expect(await getLastAction(store)).toEqual(setAmountOfTopLabels({ value: 5 }))
	})

	it("should calculate the amount of top labels when visible-file-states are changed", async () => {
		const visibleFileStates = [
			{
				file: {
					fileMeta: {
						fileName: "sample1.cc.json"
					}
				}
			}
		]
		const codeMapNodes = [
			{
				name: "sample1.ts"
			},
			{
				name: "sample2.ts"
			}
		]

		store.overrideSelector(visibleFileStatesSelector, visibleFileStates as ReturnType<typeof visibleFileStatesSelector>)
		store.overrideSelector(codeMapNodesSelector, codeMapNodes as ReturnType<typeof codeMapNodesSelector>)
		store.refreshState()

		expect(await getLastAction(store)).toEqual(setAmountOfTopLabels({ value: 1 }))
	})
})
