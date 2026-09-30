import { Injectable, inject } from "@angular/core"
import { NavigationEnd, Router } from "@angular/router"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { combineLatest, debounceTime, filter, map, startWith, tap } from "rxjs"
import { isLoadedFileSetWithoutDependencyLensSelector } from "../../../../lenses/dependency/dependencyLens.facade"
import { CcState } from "../../../../model/codeCharta.model"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import { dependencyViewEnabledSelector } from "../../../../stores/preferences/preferences.read.facade"
import { ToastService } from "../../../shared/facade"
import { AWAIT_SETTLED_FILE_STORE_WRITES_MS, injectMetricsViewRedirect } from "../redirectToMetricsView"

type UnreachableDependencyViewReason = "switched-off" | "missing-dependency-data" | null

const MISSING_DEPENDENCY_DATA_TOAST = "This file has no dependency data — switched to the map view."
const SWITCHED_OFF_TOAST = "The dependency view is experimental — switch it on in the Global Configuration."

/** The dependency view needs levels to lay anything out, and the reader has to have switched it on. Arriving
 * there, or loading a file there, without either sends the reader to the map. Compare mode is answered inside
 * the view, which explains it. */
@Injectable()
export class RedirectAwayFromDependencyViewEffect {
    private readonly store: Store<CcState> = inject(Store)
    private readonly router = inject(Router)
    private readonly toastService = inject(ToastService)
    private readonly metricsViewRedirect = injectMetricsViewRedirect("dependencies", MISSING_DEPENDENCY_DATA_TOAST)

    redirectAwayFromUnreachableDependencyView$ = createEffect(
        () =>
            combineLatest([
                this.store.select(dependencyViewEnabledSelector),
                this.store.select(visibleFileStatesSelector),
                this.store.select(isLoadedFileSetWithoutDependencyLensSelector),
                this.router.events.pipe(
                    filter(routerEvent => routerEvent instanceof NavigationEnd),
                    startWith(null)
                )
            ]).pipe(
                debounceTime(AWAIT_SETTLED_FILE_STORE_WRITES_MS),
                // The saved setting is restored before the files are, so it is only read once files are in.
                filter(([, visibleFileStates]) => visibleFileStates.length > 0 && this.metricsViewRedirect.isOnView()),
                map(([isEnabled, , isWithoutDependencyLens]) => toUnreachableReason(isEnabled, isWithoutDependencyLens)),
                filter(reason => reason !== null),
                tap(reason => this.redirectToMetricsView(reason))
            ),
        { dispatch: false }
    )

    private redirectToMetricsView(reason: UnreachableDependencyViewReason) {
        if (reason === "missing-dependency-data") {
            this.metricsViewRedirect.redirectForMissingData()
            return
        }
        this.metricsViewRedirect.redirect()
        this.toastService.show(SWITCHED_OFF_TOAST)
    }
}

function toUnreachableReason(isEnabled: boolean, isWithoutDependencyLens: boolean): UnreachableDependencyViewReason {
    if (!isEnabled) {
        return "switched-off"
    }
    return isWithoutDependencyLens ? "missing-dependency-data" : null
}
