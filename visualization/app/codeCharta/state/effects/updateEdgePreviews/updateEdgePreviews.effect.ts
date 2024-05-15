import { Injectable } from "@angular/core"
import { filter, map, withLatestFrom } from "rxjs"
import { createEffect } from "@ngrx/effects"
import { toggleEdgeMetricVisible } from "../../store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { isEdgeMetricVisibleSelector } from "../../store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { edgeMetricSelector } from "../../store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Injectable()
export class UpdateEdgePreviewsEffect {
    constructor(private store: Store<CcState>) {}

    resetIsEdgeMetricVisible$ = createEffect(() =>
        this.store.select(edgeMetricSelector).pipe(
            withLatestFrom(this.store.select(isEdgeMetricVisibleSelector)),
            filter(([, isEdgeMetricVisible]) => !isEdgeMetricVisible),
            map(() => toggleEdgeMetricVisible())
        )
    )
}
