import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { filter, map, share, tap } from "rxjs"
import { CcState, RuleEffect } from "../../../../model/codeCharta.model"
import { addExcludedNodes, addFlattenedNodes } from "../../../../stores/sharedView/sharedView.write.facade"
import { parseNodeRules } from "../../../../util/nodeRules/parseNodeRules"

const ACTION_IDENTIFIER = "ExtensionRuleAction"

export type ExtensionRuleAction = {
    type: typeof ACTION_IDENTIFIER
    action: { effect: RuleEffect }
    extensions: string[]
}

export const ruleForExtensionsPattern = (effect: RuleEffect, ...extensions: string[]): ExtensionRuleAction => ({
    type: ACTION_IDENTIFIER,
    action: { effect },
    extensions: extensions
})

@Injectable()
export class ExtensionRuleEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>
    ) {}

    private readonly extensionPatternToRules$ = this.actions$.pipe(
        ofType<ExtensionRuleAction>(ACTION_IDENTIFIER),
        map(extensionRuleAction => ({
            effect: extensionRuleAction.action.effect,
            rules: parseNodeRules(extensionRuleAction.extensions.join(","))
        })),
        share()
    )

    ruleForExtensions$ = createEffect(
        () =>
            this.extensionPatternToRules$.pipe(
                filter(({ effect }) => effect === "flatten" || effect === "exclude"),
                tap(({ effect, rules }) => {
                    this.store.dispatch(effect === "flatten" ? addFlattenedNodes({ items: rules }) : addExcludedNodes({ items: rules }))
                })
            ),
        { dispatch: false }
    )
}
