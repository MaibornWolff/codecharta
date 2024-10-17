import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { State, Store } from "@ngrx/store"
import { debounceTime, map, tap, withLatestFrom } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { LoadInitialFileService } from "../../../services/loadInitialFile/loadInitialFile.service"
import { metricDataSelector } from "../../selectors/accumulatedData/metricData/metricData.selector"
import { actionsRequiringUpdateQueryParameters } from "./actionsRequiringUpdateQueryParameters"

export enum MetricQueryParemter {
    areaMetric = "area",
    heightMetric = "height",
    colorMetric = "color",
    edgeMetric = "edge",
    currentFilesAreSampleFiles = "currentFilesAreSampleFiles"
}

@Injectable()
export class UpdateQueryParametersEffect {
    constructor(
        private loadInitialFileService: LoadInitialFileService,
        private actions$: Actions,
        private state: State<CcState>,
        private store: Store<CcState>
    ) {}

    saveMetricsInQueryParameters$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(...actionsRequiringUpdateQueryParameters),
                withLatestFrom(this.store.select(metricDataSelector)),
                map(metricData => metricData[1].edgeMetricData && metricData[1].edgeMetricData.length > 0),
                debounceTime(100),
                tap(isEdgeMetricDefined => {
                    this.updateMetricQueryParameters(isEdgeMetricDefined)
                })
            ),
        { dispatch: false }
    )

    private updateMetricQueryParameters(isEdgeMetricDefined: boolean): void {
        const state: CcState = this.state.getValue()
        const { edgeMetric, heightMetric, colorMetric, areaMetric } = state.dynamicSettings
        const isFileQueryParameterPresent = this.loadInitialFileService.checkFileQueryParameterPresent()
        if (!isFileQueryParameterPresent) {
            return
        }

        this.addOrUpdateQueryParameter(MetricQueryParemter.areaMetric, areaMetric)
        this.addOrUpdateQueryParameter(MetricQueryParemter.heightMetric, heightMetric)
        this.addOrUpdateQueryParameter(MetricQueryParemter.colorMetric, colorMetric)
        if (isEdgeMetricDefined) {
            this.addOrUpdateQueryParameter(MetricQueryParemter.edgeMetric, edgeMetric)
        } else {
            this.deleteQueryParameterIfExists(MetricQueryParemter.edgeMetric)
        }

        if (state.appStatus.currentFilesAreSampleFiles) {
            this.addOrUpdateQueryParameter(MetricQueryParemter.currentFilesAreSampleFiles, true)
        } else {
            this.deleteQueryParameterIfExists(MetricQueryParemter.currentFilesAreSampleFiles)
        }
    }

    private addOrUpdateQueryParameter(parameterName: string, parameterValue: string | number | boolean) {
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

    deleteQueryParameterIfExists(parameterName) {
        const newUrl = new URL(window.location.href)

        const queryString = newUrl.search.slice(1)
        const queryParts = queryString.length > 0 ? queryString.split("&") : []
        const updatedQuery = []

        for (const part of queryParts) {
            const [key, value] = part.split("=")
            if (key !== parameterName) {
                updatedQuery.push(`${key}=${value}`)
            }
        }

        newUrl.search = updatedQuery.join("&")
        window.history.replaceState(null, "", newUrl.toString())
    }
}
