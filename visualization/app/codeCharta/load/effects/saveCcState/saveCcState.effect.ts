import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { debounceTime, filter, tap } from "rxjs"
import { fileActions } from "../../../stores/fileStore/fileStore.facade"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { writeCcFiles, writeCcState } from "../../../stores/rootStore/indexedDB/indexedDBWriter"
import { setState } from "../../../stores/rootStore/state.actions"
import { setHoveredNodePath } from "../../../stores/sharedView/sharedView.write.facade"
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
                filter(action => action.type !== setHoveredNodePath.type),
                ofType(...actionsRequiringSaveCcState),
                debounceTime(SAVE_DEBOUNCE_MS),
                tap(() => this.saveWhenIdle(() => writeCcState(this.ccStateSnapshot.get())))
            ),
        { dispatch: false }
    )

    /** The files are written on their own, only when they can have changed: they are by far the largest
     * thing the session holds. */
    saveCcFiles$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(...actionsRequiringSaveCcFiles),
                debounceTime(SAVE_DEBOUNCE_MS),
                tap(() => this.saveWhenIdle(() => writeCcFiles(this.ccStateSnapshot.get().files)))
            ),
        { dispatch: false }
    )

    // The writers raise the spinner themselves, for the one write that copies the loaded maps — from
    // here a settings save and a file save look alike.
    private saveWhenIdle(write: () => Promise<void>): void {
        runWhenIdle(() => {
            // Nobody awaits the write: unreported it passes silently.
            void write().catch(error => console.error("Failed to persist the session:", error))
        })
    }
}
