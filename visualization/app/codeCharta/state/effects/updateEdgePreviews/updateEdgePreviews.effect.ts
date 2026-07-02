import { Injectable } from "@angular/core"
import { filter, map, withLatestFrom } from "rxjs"
import { createEffect } from "@ngrx/effects"
import { isEdgeMetricVisibleSelector, toggleEdgeMetricVisible, edgeMetricSelector } from "../../../mapState/mapState.facade"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Injectable()
export class UpdateEdgePreviewsEffect {
    constructor(private readonly store: Store<CcState>) {}

    resetIsEdgeMetricVisible$ = createEffect(() =>
        this.store.select(edgeMetricSelector).pipe(
            withLatestFrom(this.store.select(isEdgeMetricVisibleSelector)),
            filter(([, isEdgeMetricVisible]) => !isEdgeMetricVisible),
            map(() => toggleEdgeMetricVisible())
        )
    )
}
