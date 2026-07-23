import { Injectable } from "@angular/core"
import { NavigationEnd, Router } from "@angular/router"
import { distinctUntilChanged, filter, map, Observable, shareReplay, startWith } from "rxjs"
import { ViewId, viewIdForLink } from "./routePaths"

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
        return viewIdForLink(this.router.url)
    }
}
