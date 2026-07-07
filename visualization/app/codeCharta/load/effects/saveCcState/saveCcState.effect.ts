import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { State } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { debounceTime, filter, tap } from "rxjs"
import { writeCcState } from "../../../store/indexedDB/indexedDBWriter"
import { actionsRequiringSaveCcState } from "./actionsRequiringSaveCcState"
import { setHoveredNodeId } from "../../../stores/sharedView/sharedView.write.facade"

@Injectable()
export class SaveCcStateEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly state: State<CcState>
    ) {}

    saveCcState$ = createEffect(
        () =>
            this.actions$.pipe(
                filter(action => action.type !== setHoveredNodeId.type),
                ofType(...actionsRequiringSaveCcState),
                debounceTime(500),
                tap(async () => {
                    const state: CcState = this.state.getValue()
                    await writeCcState(state)
                })
            ),
        { dispatch: false }
    )
}
