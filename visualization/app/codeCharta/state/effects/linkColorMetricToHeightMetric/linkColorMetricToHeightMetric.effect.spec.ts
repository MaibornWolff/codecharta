import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"
import { isColorMetricLinkedToHeightMetricSelector } from "../../store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { LinkColorMetricToHeightMetricEffect } from "./linkColorMetricToHeightMetric.effect"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { EffectsModule } from "@ngrx/effects"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { Action } from "@ngrx/store"
import { provideMockActions } from "@ngrx/effects/testing"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("linkHeightAndColorMetricEffect", () => {
	let actions$: BehaviorSubject<Action>
	let store: MockStore

	beforeEach(() => {
		actions$ = new BehaviorSubject({ type: "" })
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([LinkColorMetricToHeightMetricEffect])],
			providers: [
				provideMockStore({
					selectors: [
						{ selector: heightMetricSelector, value: "loc" },
						{ selector: isColorMetricLinkedToHeightMetricSelector, value: true }
					]
				}),
				provideMockActions(() => actions$)
			]
		})
		store = TestBed.inject(MockStore)
	})

	afterEach(() => {
		actions$.complete()
	})

	it("should not set color metric when height metric changes but height and color metric are not linked", async () => {
		store.overrideSelector(isColorMetricLinkedToHeightMetricSelector, false)
		store.refreshState()
		store.overrideSelector(heightMetricSelector, "rloc")
		store.refreshState()
		expect(await getLastAction(store)).toEqual({ type: "@ngrx/effects/init" })
	})

	it("should set color metric to the same height metric when height metric changes and height and color metric are linked", async () => {
		store.overrideSelector(heightMetricSelector, "rloc")
		store.refreshState()
		expect(await getLastAction(store)).toEqual(setColorMetric({ value: "rloc" }))
	})
})
