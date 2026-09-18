import { Injectable } from "@angular/core"
import { combineLatest, distinctUntilChanged, map, Observable, of, switchMap, timer } from "rxjs"
import { ViewId } from "../../../routing/routePaths"
import { ViewReadinessStore } from "../../../routing/viewReadiness.store"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { isApplyingScenario$ } from "../../../util/busy/isApplyingScenario"
import { isPendingSave$ } from "../../../util/busy/isPendingSave"
import { loadPhase$ } from "../../../util/busy/loadPhase"
import { isPendingHeavyDispatch$ } from "../../../util/dispatchAfterPaint"

const DRAWING_PHASE_OF_VIEW: Record<ViewId, string> = {
    metrics: "Drawing the map",
    domain: "Drawing the word cloud"
}
const SAVING_SESSION_PHASE = "Saving your session"

/** How long the spinner stays up after the last thing it waits for stops. A load hands over between
 * signals, and without the hold that gap reads as a flash followed by a second spinner. */
const SETTLE_HOLD_MS = 400

@Injectable({
    providedIn: "root"
})
export class LoadingFileProgressSpinnerService {
    constructor(
        private readonly viewReadinessStore: ViewReadinessStore,
        private readonly fileStoreReadWindow: FileStoreReadWindow
    ) {}

    isLoading$(view: ViewId): Observable<boolean> {
        return combineLatest([
            this.viewReadinessStore.isStale$(view),
            this.fileStoreReadWindow.isLoadingFile$,
            isPendingHeavyDispatch$,
            isApplyingScenario$,
            // Writing the session copies it on the main thread, so the map cannot answer while it runs.
            isPendingSave$
        ]).pipe(
            map(sources => sources.some(Boolean)),
            distinctUntilChanged(),
            // Busy takes effect at once, idle waits out the hold, so work picking up again shows no gap.
            switchMap(isLoading => (isLoading ? of(true) : timer(SETTLE_HOLD_MS).pipe(map(() => false)))),
            distinctUntilChanged()
        )
    }

    /** What the spinner is waiting for once the load has stopped announcing its own phases. */
    phase$(view: ViewId): Observable<string | null> {
        return combineLatest([loadPhase$, this.viewReadinessStore.isStale$(view), isPendingHeavyDispatch$, isPendingSave$]).pipe(
            map(
                ([announcedPhase, isViewStale, isDispatchPending, isSavePending]) =>
                    announcedPhase ?? this.phaseOfRemainingWork(view, isViewStale || isDispatchPending, isSavePending)
            ),
            distinctUntilChanged()
        )
    }

    // The save outranks the draw: it blocks the main thread, while the draw only waits for frames.
    private phaseOfRemainingWork(view: ViewId, isDrawing: boolean, isSavePending: boolean): string | null {
        if (isSavePending) {
            return SAVING_SESSION_PHASE
        }
        return isDrawing ? DRAWING_PHASE_OF_VIEW[view] : null
    }
}
