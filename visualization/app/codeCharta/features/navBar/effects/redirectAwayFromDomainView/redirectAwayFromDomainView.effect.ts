import { Injectable } from "@angular/core"
import { NavigationEnd, Router } from "@angular/router"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { combineLatest, filter, map, merge, tap, withLatestFrom } from "rxjs"
import { isLoadedFileSetWithoutDomainLensSelector } from "../../../../lenses/domain/domainLens.facade"
import { CcState } from "../../../../model/codeCharta.model"
import { routeLinks } from "../../../../routing/routePaths"
import { isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"

/**
 * Sends the user back to the metrics view whenever the domain view cannot be offered — either because the
 * loaded file set carries no domain lens (cc.json 1.x files), so the view would render nothing, or because
 * delta mode is active, where the nav bar swaps the view switcher for the delta chrome. In both cases the
 * nav bar stops offering a way back, so staying on the domain view would be a navigation dead end.
 *
 * This is an effect rather than a `CanMatch`/`CanActivate` guard on the domain route on purpose: a guard
 * only runs on navigation, and at the one moment it would matter most — a reload of the "#/domain" deep
 * link — it runs BEFORE the file has been loaded, when no file can answer the question yet, so it would
 * bounce cc.json 2.0 deep links too.
 *
 * The redirect condition is therefore re-evaluated on ALL of its inputs: the loaded file set (a 1.x file
 * picked while the domain view is open), the delta mode (switched on while the domain view is open) and the
 * active route (the domain view reached by a hash edit or a shared link after a 1.x file has settled). It
 * replaces the history entry, so the Back button cannot return the user to the view they were sent away from.
 *
 * The file-set half of the condition lives in the domain lens next to `hasDomainDataSelector`, the switcher's
 * own gate: the two answer the same question from different angles, and when they disagree the switcher
 * offers a view this effect immediately bounces the user out of. Keeping them side by side makes that
 * pairing reviewable.
 */
@Injectable()
export class RedirectAwayFromDomainViewEffect {
    constructor(
        private readonly store: Store<CcState>,
        private readonly router: Router
    ) {}

    private readonly isDomainViewUnreachable$ = combineLatest([
        this.store.select(isLoadedFileSetWithoutDomainLensSelector),
        this.store.select(isDeltaStateSelector)
    ]).pipe(map(([isLoadedFileSetWithoutDomainLens, isDeltaState]) => isLoadedFileSetWithoutDomainLens || isDeltaState))

    private readonly navigated$ = this.router.events.pipe(filter(routerEvent => routerEvent instanceof NavigationEnd))

    redirectToMetricsViewWithoutDomainLens$ = createEffect(
        () =>
            merge(
                this.isDomainViewUnreachable$,
                this.navigated$.pipe(
                    withLatestFrom(this.isDomainViewUnreachable$),
                    map(([, isDomainViewUnreachable]) => isDomainViewUnreachable)
                )
            ).pipe(
                filter(isDomainViewUnreachable => isDomainViewUnreachable && this.isOnDomainRoute()),
                tap(() => this.router.navigateByUrl(routeLinks.metrics, { replaceUrl: true }))
            ),
        { dispatch: false }
    )

    private isOnDomainRoute(): boolean {
        return this.router.url.split("?")[0] === routeLinks.domain
    }
}
