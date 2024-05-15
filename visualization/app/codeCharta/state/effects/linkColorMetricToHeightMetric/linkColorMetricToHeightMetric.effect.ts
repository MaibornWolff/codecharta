import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { combineLatest, filter, map } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { isColorMetricLinkedToHeightMetricSelector } from "../../store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"

import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"

@Injectable()
export class LinkColorMetricToHeightMetricEffect {
    constructor(private store: Store<CcState>) {}

    linkHeightAndColorMetric$ = createEffect(() =>
        combineLatest([this.store.select(heightMetricSelector), this.store.select(isColorMetricLinkedToHeightMetricSelector)]).pipe(
            filter(([, isColorMetricLinkedToHeightMetric]) => isColorMetricLinkedToHeightMetric),
            map(([heightMetric]) => setColorMetric({ value: heightMetric }))
        )
    )
}
