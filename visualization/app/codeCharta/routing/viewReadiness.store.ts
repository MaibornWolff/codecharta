import { Injectable } from "@angular/core"
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs"
import { VIEW_IDS, ViewId } from "./routePaths"

/**
 * Which views still have to catch up with the current data.
 *
 * A view is "stale" from the moment the data behind it changes until it has rebuilt its own content.
 * Each view renders its own spinner from its own flag, so a load on the domain view never waits for
 * the 3D map, and the map's rebuild — which is deferred until the metrics view is actually on screen —
 * shows its spinner at the moment the user switches to it rather than blocking a view they cannot see.
 *
 * This deliberately replaces the single global `isLoadingFile` boolean: one flag cannot express "domain
 * is ready but metrics is not", which is exactly the state the app is in while you work in the domain
 * view. It is kept out of `CcState` because it is transient view bookkeeping — persisting it would
 * restore a stale-forever view on the next boot.
 */
@Injectable({ providedIn: "root" })
export class ViewReadinessStore {
    // Everything starts stale: nothing has rendered yet at boot.
    private readonly staleViews$ = new BehaviorSubject<ReadonlySet<ViewId>>(new Set(VIEW_IDS))

    isStale$(view: ViewId): Observable<boolean> {
        return this.staleViews$.pipe(
            map(staleViews => staleViews.has(view)),
            distinctUntilChanged()
        )
    }

    isStale(view: ViewId): boolean {
        return this.staleViews$.value.has(view)
    }

    /** The data changed, so every view has to rebuild — each on its own schedule. */
    markAllStale(): void {
        this.staleViews$.next(new Set(VIEW_IDS))
    }

    markReady(view: ViewId): void {
        if (!this.isStale(view)) {
            return
        }
        const staleViews = new Set(this.staleViews$.value)
        staleViews.delete(view)
        this.staleViews$.next(staleViews)
    }
}
