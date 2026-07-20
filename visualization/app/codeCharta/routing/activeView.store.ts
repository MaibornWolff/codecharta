import { Injectable } from "@angular/core"
import { NavigationEnd, Router } from "@angular/router"
import { distinctUntilChanged, filter, map, Observable, shareReplay, startWith } from "rxjs"
import { ViewId } from "../stores/viewReadiness/viewReadiness.store"
import { routeLinks } from "./routePaths"

/**
 * Which routed view is currently on screen.
 *
 * The route-reuse strategy detaches views instead of destroying them, so a view cannot tell from its own
 * lifecycle whether the user is looking at it — the component instance outlives the navigation. The URL
 * is the only source of truth, and work that is only worth doing for a visible view (above all the 3D
 * map's render) reads it from here.
 */
@Injectable({ providedIn: "root" })
export class ActiveViewStore {
    readonly activeView$: Observable<ViewId>

    constructor(private readonly router: Router) {
        this.activeView$ = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => this.currentView()),
            startWith(this.currentView()),
            distinctUntilChanged(),
            shareReplay({ bufferSize: 1, refCount: false })
        )
    }

    currentView(): ViewId {
        return this.router.url.split("?")[0] === routeLinks.domain ? "domain" : "metrics"
    }
}
