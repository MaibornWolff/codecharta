import { Injectable, inject } from "@angular/core"
import { NavigationEnd, Router } from "@angular/router"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { combineLatest, debounceTime, filter, map, merge, tap, withLatestFrom } from "rxjs"
import { isLoadedFileSetWithoutDomainLensSelector } from "../../../../lenses/domain/domainLens.facade"
import { CcState } from "../../../../model/codeCharta.model"
import { routeLinks, viewIdForLink } from "../../../../routing/routePaths"
import { isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { ToastService } from "../../../shared/facade"

/** Why the domain view had to be left — `null` means it is still reachable. */
type RedirectReason = "missing-domain-data" | "delta" | null

const MISSING_DOMAIN_DATA_TOAST = "This file has no domain-language data — switched to the map view."

/**
 * The condition is only read once the file-store writes of one task have settled. A restore commits the
 * same file TWICE in one task: first re-parsed from the persisted state, which loses the domain lens on
 * the way through the flat 1.x export shape, and only then the persisted file state that still carries it.
 * Reading the condition on the first of the two bounced every reload of the "#/domain" deep link.
 */
const SETTLE_FILE_SET_MS = 0

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
    private readonly store: Store<CcState> = inject(Store)
    private readonly router = inject(Router)
    private readonly toastService = inject(ToastService)

    private readonly redirectReason$ = combineLatest([
        this.store.select(isLoadedFileSetWithoutDomainLensSelector),
        this.store.select(isDeltaStateSelector)
    ]).pipe(
        debounceTime(SETTLE_FILE_SET_MS),
        map(([isLoadedFileSetWithoutDomainLens, isDeltaState]) => this.toRedirectReason(isLoadedFileSetWithoutDomainLens, isDeltaState))
    )

    private readonly navigated$ = this.router.events.pipe(filter(routerEvent => routerEvent instanceof NavigationEnd))

    redirectAwayFromUnreachableDomainView$ = createEffect(
        () =>
            merge(
                this.redirectReason$,
                this.navigated$.pipe(
                    withLatestFrom(this.redirectReason$),
                    map(([, redirectReason]) => redirectReason)
                )
            ).pipe(
                filter(redirectReason => redirectReason !== null && this.isOnDomainRoute()),
                tap(redirectReason => this.redirectToMetricsView(redirectReason))
            ),
        { dispatch: false }
    )

    private toRedirectReason(isLoadedFileSetWithoutDomainLens: boolean, isDeltaState: boolean): RedirectReason {
        if (isLoadedFileSetWithoutDomainLens) {
            return "missing-domain-data"
        }
        if (isDeltaState) {
            return "delta"
        }
        return null
    }

    private redirectToMetricsView(redirectReason: RedirectReason): void {
        this.router.navigateByUrl(routeLinks.metrics, { replaceUrl: true })
        // Only the missing-data case is silent enough to blindside the user; delta mode is their own toggle.
        if (redirectReason === "missing-domain-data") {
            this.toastService.show(MISSING_DOMAIN_DATA_TOAST)
        }
    }

    private isOnDomainRoute(): boolean {
        return viewIdForLink(this.router.url) === "domain"
    }
}
