import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { State, Store } from "@ngrx/store"
import { debounceTime, filter, map, tap, withLatestFrom } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { LoadInitialFileService } from "../../../services/loadInitialFile/loadInitialFile.service"
import { metricDataSelector } from "../../selectors/accumulatedData/metricData/metricData.selector"
import { setHoveredNodeId } from "../../store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { actionsRequiringSaveMetricsInQueryParameters } from "./actionsRequiringSaveMetricsInQueryParameters"

@Injectable()
export class SaveMetricsInQueryParametersEffect {
	constructor(
		private loadInitialFileService: LoadInitialFileService,
		private actions$: Actions,
		private state: State<CcState>,
		private store: Store<CcState>
	) {}

	saveMetricsInQueryParameters$ = createEffect(
		() =>
			this.actions$.pipe(
				filter(action => action.type !== setHoveredNodeId.type),
				ofType(...actionsRequiringSaveMetricsInQueryParameters),
				withLatestFrom(this.store.select(metricDataSelector)),
				map(metricData => metricData[1].edgeMetricData.length > 0),
				debounceTime(100),
				tap(async isEdgeMetricDefined => {
					const state: CcState = this.state.getValue()
					const dynamicSettings = state.dynamicSettings
					const edgeMetric = dynamicSettings.edgeMetric
					const heightMetric = dynamicSettings.heightMetric
					const colorMetric = dynamicSettings.colorMetric
					const areaMetric = dynamicSettings.areaMetric

					const isFileQueryParameterPresent = this.loadInitialFileService.checkFileQueryParameterPresent()
					if (!isFileQueryParameterPresent) {
						return
					}

					addOrUpdateQueryParameter("area", areaMetric)
					addOrUpdateQueryParameter("height", heightMetric)
					addOrUpdateQueryParameter("color", colorMetric)
					if (isEdgeMetricDefined) {
						addOrUpdateQueryParameter("edge", edgeMetric)
					}
				})
			),
		{ dispatch: false }
	)
}

function addOrUpdateQueryParameter(parameterName, parameterValue) {
	const newUrl = new URL(window.location.href)

	const queryString = newUrl.search.slice(1)
	const queryParts = queryString.length > 0 ? queryString.split("&") : []
	const updatedQuery = []
	let parameterFound = false

	for (const part of queryParts) {
		const key = part.split("=")[0]
		if (key === parameterName) {
			updatedQuery.push(`${parameterName}=${encodeURIComponent(parameterValue)}`)
			parameterFound = true
		} else {
			updatedQuery.push(part)
		}
	}

	if (!parameterFound) {
		updatedQuery.push(`${parameterName}=${encodeURIComponent(parameterValue)}`)
	}

	newUrl.search = updatedQuery.join("&")

	window.history.replaceState(null, "", newUrl.toString())
}
