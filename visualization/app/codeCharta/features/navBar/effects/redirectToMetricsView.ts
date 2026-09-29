import { inject } from "@angular/core"
import { Router } from "@angular/router"
import { routeLinks, ViewId, viewIdForLink } from "../../../routing/routePaths"
import { ToastService } from "../../shared/facade"

export const AWAIT_SETTLED_FILE_STORE_WRITES_MS = 0

export interface MetricsViewRedirect {
    isOnView(): boolean
    redirect(): void
    redirectForMissingData(): void
}

/** Sends the reader from a view that cannot show the loaded files back to the metrics view, replacing the
 * history entry so the back button cannot return to the empty view. */
export function injectMetricsViewRedirect(view: ViewId, missingDataToast: string): MetricsViewRedirect {
    const router = inject(Router)
    const toastService = inject(ToastService)
    const redirect = () => {
        router.navigateByUrl(routeLinks.metrics, { replaceUrl: true })
    }
    return {
        isOnView: () => viewIdForLink(router.url) === view,
        redirect,
        redirectForMissingData: () => {
            redirect()
            toastService.show(missingDataToast)
        }
    }
}
