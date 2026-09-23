import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { createSelector, Store } from "@ngrx/store"
import { filter, map } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { heightMetricSelector, isSunburstLayoutSelector } from "../../../../stores/mapState/mapState.read.facade"
import { setColorMetric } from "../../../../stores/mapState/mapState.write.facade"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../../stores/preferences/preferences.read.facade"

export const heightAndLinkedSelector = createSelector(
    heightMetricSelector,
    isColorMetricLinkedToHeightMetricSelector,
    isSunburstLayoutSelector,
    (heightMetric, isLinked, isSunburst) => ({ heightMetric, isLinked: isLinked && !isSunburst })
)

@Injectable()
export class LinkColorMetricToHeightMetricEffect {
    constructor(private readonly store: Store<CcState>) {}

    linkHeightAndColorMetric$ = createEffect(() =>
        this.store.select(heightAndLinkedSelector).pipe(
            filter(({ isLinked }) => isLinked),
            map(({ heightMetric }) => setColorMetric({ value: heightMetric }))
        )
    )
}
