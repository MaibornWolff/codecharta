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

type RedirectReason = "missing-domain-data" | "delta" | null

const MISSING_DOMAIN_DATA_TOAST = "This file has no domain-language data — switched to the map view."

const AWAIT_SETTLED_FILE_STORE_WRITES_MS = 0

@Injectable()
export class RedirectAwayFromDomainViewEffect {
    private readonly store: Store<CcState> = inject(Store)
    private readonly router = inject(Router)
    private readonly toastService = inject(ToastService)

    private readonly redirectReason$ = combineLatest([
        this.store.select(isLoadedFileSetWithoutDomainLensSelector),
        this.store.select(isDeltaStateSelector)
    ]).pipe(
        debounceTime(AWAIT_SETTLED_FILE_STORE_WRITES_MS),
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
        if (redirectReason === "missing-domain-data") {
            this.toastService.show(MISSING_DOMAIN_DATA_TOAST)
        }
    }

    private isOnDomainRoute(): boolean {
        return viewIdForLink(this.router.url) === "domain"
    }
}
