import { Injectable } from "@angular/core"
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs"
import { VIEW_IDS, ViewId } from "./routePaths"

@Injectable({ providedIn: "root" })
export class ViewReadinessStore {
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
