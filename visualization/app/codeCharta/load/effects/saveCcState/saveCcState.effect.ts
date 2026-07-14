import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { debounceTime, filter, tap } from "rxjs"
import { CcState } from "../../../model/codeCharta.model"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { writeCcState } from "../../../stores/rootStore/indexedDB/indexedDBWriter"
import { setHoveredNodeId } from "../../../stores/sharedView/sharedView.write.facade"
import { actionsRequiringSaveCcState } from "./actionsRequiringSaveCcState"

@Injectable()
export class SaveCcStateEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly ccStateSnapshot: CcStateSnapshot
    ) {}

    saveCcState$ = createEffect(
        () =>
            this.actions$.pipe(
                filter(action => action.type !== setHoveredNodeId.type),
                ofType(...actionsRequiringSaveCcState),
                debounceTime(500),
                tap(async () => {
                    const state: CcState = this.ccStateSnapshot.get()
                    await writeCcState(state)
                })
            ),
        { dispatch: false }
    )
}
