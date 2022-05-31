import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { setAmountOfEdgePreviews } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { toggleEdgeMetricVisible } from "../../store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { setEdgeMetric } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setEdges } from "../../store/fileSettings/edges/edges.actions"
import { Store } from "../../store/store"
import { UpdateEdgePreviewsEffect } from "./updateEdgePreviews.effect"

describe("updateEdgePreviewsEffect", () => {
	let dispatchSpy

	beforeEach(async () => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UpdateEdgePreviewsEffect])]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise

		dispatchSpy = jest.spyOn(Store.store, "dispatch")
	})

	it("should ignore a not relevant action", () => {
		Store.dispatch({ type: "whatever" })
		expect(dispatchSpy).toHaveBeenCalledTimes(1)
	})

	it("should set isEdgeMetricVisible to true on edgeMetric change, if it was false", () => {
		Store.dispatch(toggleEdgeMetricVisible()) // toggle first as it is true initially
		Store.dispatch(setEdgeMetric("rloc"))
		expect(dispatchSpy.mock.calls[2][0]).toEqual(toggleEdgeMetricVisible())
	})

	it("should not set isEdgeMetricVisible to false on edgeMetric change, if it was true", () => {
		Store.dispatch(setEdgeMetric("rloc"))
		expect(dispatchSpy).not.toHaveBeenCalledWith(toggleEdgeMetricVisible())
	})

	it("should update edges on amountOfEdgePreviewsSelector changed", () => {
		Store.dispatch(setAmountOfEdgePreviews(0))
		expect(dispatchSpy).toHaveBeenCalledWith(setEdges([]))
	})
})
