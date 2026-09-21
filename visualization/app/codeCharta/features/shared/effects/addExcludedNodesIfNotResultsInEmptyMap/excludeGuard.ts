import { Injectable } from "@angular/core"
import { Actions, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { map, share, withLatestFrom } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import { excludedNodesSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { addExcludedNodesIfNotResultsInEmptyMap } from "../../../../stores/sharedView/sharedView.write.facade"
import { createExcludeMatcher } from "../../../../util/nodeRules/excludeMatcher"
import { resultsInEmptyMap } from "../../../../util/nodeRules/resultsInEmptyMap"

@Injectable({ providedIn: "root" })
export class ExcludeGuard {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>
    ) {}

    readonly doExcludedNodesResultInEmptyMap$ = this.actions$.pipe(
        ofType(addExcludedNodesIfNotResultsInEmptyMap),
        withLatestFrom(this.store.select(visibleFileStatesSelector), this.store.select(excludedNodesSelector)),
        map(([action, visibleFiles, excludedNodes]) => ({
            items: action.items,
            resultsInEmptyMap: resultsInEmptyMap(visibleFiles, createExcludeMatcher([...excludedNodes, ...action.items]))
        })),
        share()
    )
}
