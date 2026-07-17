import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { debounceTime, map, tap, withLatestFrom } from "rxjs"
import { CcState } from "../../../model/codeCharta.model"
import { edgeMetricDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { QueryParamsService } from "../../../util/queryParameter/queryParams.service"
import { actionsRequiringUpdateQueryParameters } from "./actionsRequiringUpdateQueryParameters"

@Injectable()
export class UpdateQueryParametersEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly queryParamsService: QueryParamsService,
        private readonly store: Store<CcState>
    ) {}

    saveMetricsInQueryParameters$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(...actionsRequiringUpdateQueryParameters),
                withLatestFrom(this.store.select(edgeMetricDataSelector)),
                map(([, edgeMetricData]) => edgeMetricData && edgeMetricData.length > 0),
                debounceTime(100),
                tap(isEdgeMetricDefined => {
                    this.updateMetricQueryParameters(isEdgeMetricDefined)
                })
            ),
        { dispatch: false }
    )

    private updateMetricQueryParameters(isEdgeMetricDefined: boolean): void {
        const { edgeMetric, heightMetric, colorMetric, areaMetric } = this.mapStateReadWindow.getMapState()

        this.queryParamsService.write({
            areaMetric,
            heightMetric,
            colorMetric,
            edgeMetric,
            isEdgeMetricDefined,
            currentFilesAreSampleFiles: this.fileStoreReadWindow.getCurrentFilesAreSampleFiles()
        })
    }
}
