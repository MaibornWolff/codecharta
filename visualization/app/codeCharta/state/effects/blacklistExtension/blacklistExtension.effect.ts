import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { filter, map, share, tap } from "rxjs"
import { BlacklistType, CcState } from "../../../codeCharta.model"
import { addBlacklistItems } from "../../store/fileSettings/blacklist/blacklist.actions"
import { parseBlacklistItems } from "../../../ui/ribbonBar/searchPanel/searchBar/utils/parseBlacklistItems"

const ACTION_IDENTIFIER = "BlacklistExtensionAction"

type BlacklistExtensionAction = {
    type: typeof ACTION_IDENTIFIER
    action: { type: BlacklistType }
    extensions: string[]
}

export const blacklistExtensionsPattern = (type: BlacklistType, ...extensions: string[]): BlacklistExtensionAction => ({
    type: ACTION_IDENTIFIER,
    action: { type },
    extensions: extensions
})

@Injectable()
export class BlacklistExtensionEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>
    ) {}

    private readonly searchPattern2BlacklistItems$ = this.actions$.pipe(
        ofType<BlacklistExtensionAction>(ACTION_IDENTIFIER),
        map(blacklistExtensionAction => ({
            blackListType: blacklistExtensionAction.action.type,
            extensionToBlacklist: parseBlacklistItems(blacklistExtensionAction.action.type, blacklistExtensionAction.extensions.join(","))
        })),
        share()
    )

    blackListExtensions$ = createEffect(
        () =>
            this.searchPattern2BlacklistItems$.pipe(
                filter(item => item.blackListType === "flatten" || item.blackListType === "exclude"),
                tap(item => {
                    this.store.dispatch(addBlacklistItems({ items: item.extensionToBlacklist }))
                })
            ),
        { dispatch: false }
    )
}
