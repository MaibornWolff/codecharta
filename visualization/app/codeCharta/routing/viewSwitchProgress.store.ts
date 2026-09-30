import { Injectable, inject } from "@angular/core"
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationSkipped, Router } from "@angular/router"
import { BehaviorSubject, distinctUntilChanged, filter, Observable, of, race, Subscription, switchMap, take, timer } from "rxjs"
import { ViewId } from "./routePaths"
import { ViewReadinessStore } from "./viewReadiness.store"

/** Ends a switch whose view never reports ready, so the spinner cannot stay up for good. */
export const VIEW_SWITCH_MAX_WAIT_MS = 10_000

type SettlingEvent = NavigationEnd | NavigationCancel | NavigationError | NavigationSkipped

const isSettlingEvent = (event: Event): event is SettlingEvent =>
    event instanceof NavigationEnd ||
    event instanceof NavigationCancel ||
    event instanceof NavigationError ||
    event instanceof NavigationSkipped

/** The view a switch is building, from the moment the switch is announced until that view reports ready. */
@Injectable({ providedIn: "root" })
export class ViewSwitchProgressStore {
    private readonly router = inject(Router)
    private readonly viewReadinessStore = inject(ViewReadinessStore)
    private readonly pendingViewSubject = new BehaviorSubject<ViewId | null>(null)
    private arrivalWatch = Subscription.EMPTY

    readonly pendingView$: Observable<ViewId | null> = this.pendingViewSubject.pipe(distinctUntilChanged())

    /** Returns whether `view` has to be built before it can be shown, and shows the switch as pending if so. */
    announceSwitchTo(view: ViewId): boolean {
        if (!this.router.navigated || !this.viewReadinessStore.isStale(view)) {
            return false
        }
        this.arrivalWatch.unsubscribe()
        this.pendingViewSubject.next(view)
        this.arrivalWatch = this.arrivalAt(view).subscribe(() => this.pendingViewSubject.next(null))
        return true
    }

    private arrivalAt(view: ViewId): Observable<unknown> {
        const readyOrAbandoned$ = this.router.events.pipe(
            filter(isSettlingEvent),
            take(1),
            switchMap(event => (event instanceof NavigationEnd ? this.readinessOf(view) : of(event)))
        )
        return race(readyOrAbandoned$, timer(VIEW_SWITCH_MAX_WAIT_MS)).pipe(take(1))
    }

    private readinessOf(view: ViewId): Observable<boolean> {
        return this.viewReadinessStore.isStale$(view).pipe(filter(isStale => !isStale))
    }
}
