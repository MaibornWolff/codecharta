import { Injectable } from "@angular/core"
import { combineLatest, map, Observable } from "rxjs"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { ViewId, ViewReadinessStore } from "../../../stores/viewReadiness/viewReadiness.store"
import { isApplyingScenario$ } from "../../../util/busy/isApplyingScenario"
import { isPendingHeavyDispatch$ } from "../../../util/dispatchAfterPaint"

/**
 * Whether a given view is currently busy, and therefore not usable.
 *
 * Three of the four sources look global but are not a problem, because only the ACTIVE view's spinner
 * is in the DOM — the other view is detached by the route-reuse strategy, so its overlay cannot be seen:
 *
 * - a load in flight busies everything: until it commits (or fails) there is nothing new to show, and
 *   no view can be rebuilt. This is also what covers a load that never commits — staleness is only
 *   raised once files actually land, so a failed load cannot strand a view.
 * - a heavy dispatch is feedback for the click that started it, which happened in the view the user is
 *   looking at. It covers that view until its content settles.
 * - applying a scenario rewrites the settings behind every view at once, so nothing is usable while it
 *   runs.
 *
 * Per-view staleness is the part that genuinely differs between views — see ViewReadinessStore.
 */
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
            isApplyingScenario$
        ]).pipe(map(sources => sources.some(Boolean)))
    }
}
