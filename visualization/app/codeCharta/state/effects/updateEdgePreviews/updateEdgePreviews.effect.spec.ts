import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Subject } from "rxjs"
import { Action } from "@ngrx/store"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { toggleEdgeMetricVisible } from "../../store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { UpdateEdgePreviewsEffect } from "./updateEdgePreviews.effect"
import { edgeMetricSelector } from "../../store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { isEdgeMetricVisibleSelector } from "../../store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("updateEdgePreviewsEffect", () => {
	let actions$: Subject<Action>
	let store: MockStore

	beforeEach(() => {
		actions$ = new Subject()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UpdateEdgePreviewsEffect])],
			providers: [
				provideMockStore({
					selectors: [
						{ selector: edgeMetricSelector, value: "loc" },
						{ selector: isEdgeMetricVisibleSelector, value: false }
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

	it("should set isEdgeMetricVisible to true on edgeMetric change, if it was false", async () => {
		store.overrideSelector(edgeMetricSelector, "rloc")
		store.refreshState()

		expect(await getLastAction(store)).toEqual(toggleEdgeMetricVisible())
	})

	it("should not set isEdgeMetricVisible to false on edgeMetric change, if it was true", async () => {
		store.overrideSelector(isEdgeMetricVisibleSelector, true)
		store.overrideSelector(edgeMetricSelector, "rloc")
		store.refreshState()
		expect(await getLastAction(store)).toEqual({ type: "@ngrx/effects/init" })
	})
})
