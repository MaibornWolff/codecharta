import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { filter, map, withLatestFrom } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { edgeMetricSelector, isEdgeMetricVisibleSelector } from "../../../../stores/mapState/mapState.read.facade"
import { toggleEdgeMetricVisible } from "../../../../stores/mapState/mapState.write.facade"

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
