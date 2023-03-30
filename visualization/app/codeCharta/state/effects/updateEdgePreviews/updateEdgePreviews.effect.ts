import { Injectable } from "@angular/core"
import { combineLatest, filter, map, withLatestFrom } from "rxjs"
import { createEffect } from "@ngrx/effects"
import { amountOfEdgePreviewsSelector } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { edgeHeightSelector } from "../../store/appSettings/edgeHeight/edgeHeight.selector"
import { toggleEdgeMetricVisible } from "../../store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { isEdgeMetricVisibleSelector } from "../../store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { showOnlyBuildingsWithEdgesSelector } from "../../store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.selector"
import { edgeMetricSelector } from "../../store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { setEdges } from "../../store/fileSettings/edges/edges.actions"
import { edgesSelector } from "../../store/fileSettings/edges/edges.selector"
import { edgePreviewNodesSelector } from "./utils/edgePreviewNodes.selector"
import { setEdgeVisibility } from "./utils/setEdgeVisibility"
import { Store } from "@ngrx/store"
import { State } from "../../../codeCharta.model"

@Injectable()
export class UpdateEdgePreviewsEffect {
	constructor(private store: Store<State>) {}

	resetIsEdgeMetricVisible$ = createEffect(() =>
		this.store.select(edgeMetricSelector).pipe(
			withLatestFrom(this.store.select(isEdgeMetricVisibleSelector)),
			filter(([, isEdgeMetricVisible]) => !isEdgeMetricVisible),
			map(() => toggleEdgeMetricVisible())
		)
	)

	updateEdgePreviews$ = createEffect(() =>
		combineLatest([
			this.store.select(edgeMetricSelector),
			this.store.select(amountOfEdgePreviewsSelector),
			this.store.select(edgeHeightSelector),
			this.store.select(showOnlyBuildingsWithEdgesSelector)
		]).pipe(
			withLatestFrom(this.store.select(edgePreviewNodesSelector), this.store.select(edgesSelector)),
			map(([[edgeMetric], edgePreviewNodes, edges]) => {
				setEdgeVisibility(edgePreviewNodes, edges, edgeMetric)
				return setEdges({ value: edges })
			})
		)
	)
}
