import { Injectable } from "@angular/core"
import { combineLatest, distinctUntilChanged, map, Observable, of, switchMap, timer } from "rxjs"
import { ViewId } from "../../../routing/routePaths"
import { ViewReadinessStore } from "../../../routing/viewReadiness.store"
import { ViewSwitchProgressStore } from "../../../routing/viewSwitchProgress.store"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { isApplyingScenario$ } from "../../../util/busy/isApplyingScenario"
import { isPendingSave$ } from "../../../util/busy/isPendingSave"
import { loadPhase$ } from "../../../util/busy/loadPhase"
import { isPendingHeavyDispatch$ } from "../../../util/dispatchAfterPaint"

const DRAWING_PHASE_OF_VIEW: Record<ViewId, string> = {
    metrics: "Drawing the map",
    domain: "Drawing the word cloud",
    dependencies: "Drawing the dependency graph"
}
const SAVING_SESSION_PHASE = "Saving your session"

/** How long the spinner stays up after the last thing it waits for stops. A load hands over between
 * signals, and without the hold that gap reads as a flash followed by a second spinner. */
const SETTLE_HOLD_MS = 400

/** A heavy dispatch rebuilds the 3D map. The other views redraw from it in no time, so a spinner over
 * them would only hide an answer that is already there. */
const VIEW_WAITING_FOR_HEAVY_DISPATCHES: ViewId = "metrics"

@Injectable({
    providedIn: "root"
})
export class LoadingFileProgressSpinnerService {
    constructor(
        private readonly viewReadinessStore: ViewReadinessStore,
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly viewSwitchProgressStore: ViewSwitchProgressStore
    ) {}

    isLoading$(view: ViewId): Observable<boolean> {
        return combineLatest([
            this.viewReadinessStore.isStale$(view),
            this.viewSwitchProgressStore.pendingView$.pipe(map(pendingView => pendingView !== null)),
            this.fileStoreReadWindow.isLoadingFile$,
            pendingHeavyDispatchFor$(view),
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
        return combineLatest([loadPhase$, this.drawnView$(view), isPendingSave$]).pipe(
            map(([announcedPhase, drawnView, isSavePending]) => announcedPhase ?? this.phaseOfRemainingWork(drawnView, isSavePending)),
            distinctUntilChanged()
        )
    }

    private drawnView$(view: ViewId): Observable<ViewId | null> {
        return combineLatest([
            this.viewSwitchProgressStore.pendingView$,
            this.viewReadinessStore.isStale$(view),
            pendingHeavyDispatchFor$(view)
        ]).pipe(map(([pendingView, isViewStale, isDispatchPending]) => pendingView ?? (isViewStale || isDispatchPending ? view : null)))
    }

    // The save outranks the draw: it blocks the main thread, while the draw only waits for frames.
    private phaseOfRemainingWork(drawnView: ViewId | null, isSavePending: boolean): string | null {
        if (isSavePending) {
            return SAVING_SESSION_PHASE
        }
        return drawnView === null ? null : DRAWING_PHASE_OF_VIEW[drawnView]
    }
}

function pendingHeavyDispatchFor$(view: ViewId): Observable<boolean> {
    return view === VIEW_WAITING_FOR_HEAVY_DISPATCHES ? isPendingHeavyDispatch$ : of(false)
}
