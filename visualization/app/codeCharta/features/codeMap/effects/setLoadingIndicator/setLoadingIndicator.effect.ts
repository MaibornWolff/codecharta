import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { map } from "rxjs"
import { setIsLoadingFile } from "../../../../stores/fileStore/store/isLoadingFile/isLoadingFile.actions"
import { actionsRequiringRerender } from "../renderCodeMapEffect/actionsRequiringRerender"
import { setIsLoadingMap } from "../../../../stores/mapState/mapState.write.facade"
import { CcState } from "../../../../model/codeCharta.model"
import { Store } from "@ngrx/store"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/store/visibleFileStates.selector"

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
