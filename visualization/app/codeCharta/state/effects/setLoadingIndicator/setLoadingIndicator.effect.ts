import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { map } from "rxjs"
import { setIsLoadingFile } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { actionsRequiringRerender } from "../renderCodeMapEffect/actionsRequiringRerender"
import { setIsLoadingMap } from "../../store/appSettings/isLoadingMap/isLoadingMap.actions"
import { CcState } from "../../../codeCharta.model"
import { Store } from "@ngrx/store"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates/visibleFileStates.selector"

@Injectable()
export class SetLoadingIndicatorEffect {
    constructor(
        private actions$: Actions,
        private store: Store<CcState>
    ) {}

    setIsLoadingFile$ = createEffect(() => this.store.select(visibleFileStatesSelector).pipe(map(() => setIsLoadingFile({ value: true }))))

    setIsLoadingMap$ = createEffect(() =>
        this.actions$.pipe(
            ofType(...actionsRequiringRerender),
            map(() => setIsLoadingMap({ value: true }))
        )
    )
}
