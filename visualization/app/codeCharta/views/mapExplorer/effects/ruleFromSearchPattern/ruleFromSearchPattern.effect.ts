import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { filter, map, share, take, tap, withLatestFrom } from "rxjs"
import { ExcludeGuard } from "../../../../features/shared/facade"
import { CcState, RuleEffect } from "../../../../model/codeCharta.model"
import { searchPatternSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import {
    addExcludedNodesIfNotResultsInEmptyMap,
    addFlattenedNodes,
    setSearchPattern
} from "../../../../stores/sharedView/sharedView.write.facade"
import { parseNodeRules } from "../../../../util/nodeRules/parseNodeRules"

type RuleFromSearchPatternAction = {
    type: "RuleFromSearchPatternAction"
    action: { effect: RuleEffect }
}

export const ruleFromSearchPattern = (effect: RuleEffect): RuleFromSearchPatternAction => ({
    type: "RuleFromSearchPatternAction",
    action: { effect }
})

@Injectable()
export class RuleFromSearchPatternEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>,
        private readonly excludeGuard: ExcludeGuard
    ) {}

    private readonly searchPatternToRules$ = this.actions$.pipe(
        ofType<RuleFromSearchPatternAction>("RuleFromSearchPatternAction"),
        withLatestFrom(this.store.select(searchPatternSelector)),
        map(([ruleFromSearchPatternAction, searchPattern]) => ({
            effect: ruleFromSearchPatternAction.action.effect,
            rules: parseNodeRules(searchPattern)
        })),
        share()
    )

    flattenSearchPattern$ = createEffect(
        () =>
            this.searchPatternToRules$.pipe(
                filter(({ effect }) => effect === "flatten"),
                tap(({ rules }) => {
                    this.store.dispatch(addFlattenedNodes({ items: rules }))
                    this.store.dispatch(setSearchPattern({ value: "" }))
                })
            ),
        { dispatch: false }
    )

    excludeSearchPattern$ = createEffect(() =>
        this.searchPatternToRules$.pipe(
            filter(({ effect }) => effect === "exclude"),
            tap(() => {
                this.excludeGuard.doExcludedNodesResultInEmptyMap$
                    .pipe(
                        take(1),
                        filter(({ resultsInEmptyMap }) => !resultsInEmptyMap),
                        tap(() => {
                            this.store.dispatch(setSearchPattern({ value: "" }))
                        })
                    )
                    .subscribe()
            }),
            map(({ rules }) => addExcludedNodesIfNotResultsInEmptyMap({ items: rules }))
        )
    )
}
