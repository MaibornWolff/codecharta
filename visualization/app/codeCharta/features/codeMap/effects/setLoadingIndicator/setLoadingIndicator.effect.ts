import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { setIsLoadingFile, visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import { setIsLoadingMap } from "../../../../stores/mapState/mapState.write.facade"
import { actionsRequiringRerender } from "../renderCodeMapEffect/actionsRequiringRerender"

@Injectable()
export class SetLoadingIndicatorEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>
    ) {}

    setIsLoadingFile$ = createEffect(() => this.store.select(visibleFileStatesSelector).pipe(map(() => setIsLoadingFile({ value: true }))))

    setIsLoadingMap$ = createEffect(() =>
        this.actions$.pipe(
            ofType(...actionsRequiringRerender),
            map(() => setIsLoadingMap({ value: true }))
        )
    )
}
