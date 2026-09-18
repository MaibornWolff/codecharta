import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { debounceTime, filter, tap } from "rxjs"
import { fileActions } from "../../../stores/fileStore/fileStore.facade"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { writeCcFiles, writeCcState } from "../../../stores/rootStore/indexedDB/indexedDBWriter"
import { setState } from "../../../stores/rootStore/state.actions"
import { setHoveredNodeId } from "../../../stores/sharedView/sharedView.write.facade"
import { beginPendingSave, endPendingSave } from "../../../util/busy/isPendingSave"
import { runWhenIdle } from "../../../util/runWhenIdle"
import { actionsRequiringSaveCcState } from "./actionsRequiringSaveCcState"

const SAVE_DEBOUNCE_MS = 500

/** `setState` carries the files too — a map reset dispatches the whole default state through it. */
const actionsRequiringSaveCcFiles = [...fileActions, setState]

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
                debounceTime(SAVE_DEBOUNCE_MS),
                tap(() => this.saveWhenIdle(() => writeCcState(this.ccStateSnapshot.get())))
            ),
        { dispatch: false }
    )

    /**
     * The loaded files are written on their own, and only when they can have changed. They are by far
     * the largest thing the session holds, so a colour or metric change must not carry them along.
     */
    saveCcFiles$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(...actionsRequiringSaveCcFiles),
                debounceTime(SAVE_DEBOUNCE_MS),
                tap(() => this.saveWhenIdle(() => writeCcFiles(this.ccStateSnapshot.get().files)))
            ),
        { dispatch: false }
    )

    private saveWhenIdle(write: () => Promise<void>): void {
        beginPendingSave()
        runWhenIdle(() => {
            void write().finally(endPendingSave)
        })
    }
}
