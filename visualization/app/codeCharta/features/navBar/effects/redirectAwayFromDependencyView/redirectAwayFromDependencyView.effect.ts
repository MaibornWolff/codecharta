import { Injectable, inject } from "@angular/core"
import { NavigationEnd, Router } from "@angular/router"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { combineLatest, debounceTime, filter, startWith, tap } from "rxjs"
import { isLoadedFileSetWithoutDependencyLensSelector } from "../../../../lenses/dependency/dependencyLens.facade"
import { CcState } from "../../../../model/codeCharta.model"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import { AWAIT_SETTLED_FILE_STORE_WRITES_MS, injectMetricsViewRedirect } from "../redirectToMetricsView"

const MISSING_DEPENDENCY_DATA_TOAST = "This file has no dependency data — switched to the map view."

/** The dependency view needs levels to lay anything out. Arriving there, or loading a file there, without them sends
 * the reader to the map. Compare mode is answered inside the view, which explains it. */
@Injectable()
export class RedirectAwayFromDependencyViewEffect {
    private readonly store: Store<CcState> = inject(Store)
    private readonly router = inject(Router)
    private readonly metricsViewRedirect = injectMetricsViewRedirect("dependencies", MISSING_DEPENDENCY_DATA_TOAST)

    redirectAwayFromUnreachableDependencyView$ = createEffect(
        () =>
            combineLatest([
                this.store.select(visibleFileStatesSelector),
                this.store.select(isLoadedFileSetWithoutDependencyLensSelector),
                this.router.events.pipe(
                    filter(routerEvent => routerEvent instanceof NavigationEnd),
                    startWith(null)
                )
            ]).pipe(
                debounceTime(AWAIT_SETTLED_FILE_STORE_WRITES_MS),
                filter(
                    ([visibleFileStates, isWithoutDependencyLens]) =>
                        visibleFileStates.length > 0 && isWithoutDependencyLens && this.metricsViewRedirect.isOnView()
                ),
                tap(() => this.metricsViewRedirect.redirectForMissingData())
            ),
        { dispatch: false }
    )
}
