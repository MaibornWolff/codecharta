import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { createSelector, Store } from "@ngrx/store"
import { filter, map } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { isColorMetricLinkedToHeightMetricSelector } from "../../store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"

import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"

export const heightAndLinkedSelector = createSelector(
    heightMetricSelector,
    isColorMetricLinkedToHeightMetricSelector,
    (heightMetric, isLinked) => ({ heightMetric, isLinked })
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
