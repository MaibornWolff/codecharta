import { Injectable, inject } from "@angular/core"
import { NavigationEnd, Router } from "@angular/router"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { combineLatest, debounceTime, filter, map, shareReplay, switchMap, take, tap } from "rxjs"
import { isLoadedFileSetWithoutDomainLensSelector } from "../../../../lenses/domain/domainLens.facade"
import { CcState } from "../../../../model/codeCharta.model"
import { routeLinks, viewIdForLink } from "../../../../routing/routePaths"
import { isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { ToastService } from "../../../shared/facade"
import { FileSelectionModeService } from "../../services/fileSelectionMode.service"

type UnreachableDomainViewReason = "missing-domain-data" | "delta" | null

const MISSING_DOMAIN_DATA_TOAST = "This file has no domain-language data — switched to the map view."
const LEFT_COMPARE_MODE_TOAST = "Left compare mode — the domain view shows a single word cloud."

const AWAIT_SETTLED_FILE_STORE_WRITES_MS = 0

@Injectable()
export class RedirectAwayFromDomainViewEffect {
    private readonly store: Store<CcState> = inject(Store)
    private readonly router = inject(Router)
    private readonly toastService = inject(ToastService)
    private readonly fileSelectionModeService = inject(FileSelectionModeService)

    /** The route is read where the state changes rather than after the settling delay: a reason that
     * only becomes true as the user navigates onto the domain view belongs to the arrival, not to a
     * change under their feet, and must not be answered by both handlers. */
    private readonly unreachableReason$ = combineLatest([
        this.store.select(isLoadedFileSetWithoutDomainLensSelector),
        this.store.select(isDeltaStateSelector)
    ]).pipe(
        map(([isLoadedFileSetWithoutDomainLens, isDeltaState]) => ({
            reason: this.toUnreachableReason(isLoadedFileSetWithoutDomainLens, isDeltaState),
            wasOnDomainRoute: this.isOnDomainRoute()
        })),
        debounceTime(AWAIT_SETTLED_FILE_STORE_WRITES_MS),
        // Both handlers read this stream, and one of them reads it on demand — replaying the last
        // reason keeps them on one debounce instead of racing two.
        shareReplay({ bufferSize: 1, refCount: true })
    )

    private readonly navigated$ = this.router.events.pipe(filter(routerEvent => routerEvent instanceof NavigationEnd))

    redirectAwayFromUnreachableDomainView$ = createEffect(
        () =>
            this.unreachableReason$.pipe(
                filter(({ reason, wasOnDomainRoute }) => reason !== null && wasOnDomainRoute && this.isOnDomainRoute()),
                tap(({ reason }) => this.redirectToMetricsView(reason))
            ),
        { dispatch: false }
    )

    /** Compare is a mode of the metric view, so asking for the domain view means leaving it — only a
     * file set without domain data has nothing to show and sends the user back. */
    handleTheDomainViewBeingOpenedWhileUnreachable$ = createEffect(
        () =>
            this.navigated$.pipe(
                // A navigation that beats the first settled reason waits for it rather than being dropped.
                switchMap(() => this.unreachableReason$.pipe(take(1))),
                filter(({ reason }) => reason !== null && this.isOnDomainRoute()),
                tap(({ reason }) => this.makeTheDomainViewReachable(reason))
            ),
        { dispatch: false }
    )

    private makeTheDomainViewReachable(reason: UnreachableDomainViewReason): void {
        if (reason === "delta") {
            this.leaveCompareMode()
            return
        }
        this.redirectToMetricsView(reason)
    }

    private leaveCompareMode(): void {
        this.fileSelectionModeService.toggle()
        this.toastService.show(LEFT_COMPARE_MODE_TOAST)
    }

    private toUnreachableReason(isLoadedFileSetWithoutDomainLens: boolean, isDeltaState: boolean): UnreachableDomainViewReason {
        if (isLoadedFileSetWithoutDomainLens) {
            return "missing-domain-data"
        }
        if (isDeltaState) {
            return "delta"
        }
        return null
    }

    private redirectToMetricsView(reason: UnreachableDomainViewReason): void {
        this.router.navigateByUrl(routeLinks.metrics, { replaceUrl: true })
        if (reason === "missing-domain-data") {
            this.toastService.show(MISSING_DOMAIN_DATA_TOAST)
        }
    }

    private isOnDomainRoute(): boolean {
        return viewIdForLink(this.router.url) === "domain"
    }
}
