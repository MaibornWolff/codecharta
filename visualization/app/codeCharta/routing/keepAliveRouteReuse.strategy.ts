import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from "@angular/router"

/**
 * Keeps every routed view (metrics, domain) ALIVE across a view switch instead of destroying and
 * recreating it. The metrics view owns the Three.js scene/renderer, which is expensive to rebuild and —
 * more importantly — is torn down in CodeMapComponent.ngOnDestroy; recreating it on return leaves an
 * empty canvas until the next state change. Detaching (not destroying) the component subtree on
 * navigation and reattaching it on return keeps the rendered map (and the word cloud) exactly as it was.
 */
export class KeepAliveRouteReuseStrategy implements RouteReuseStrategy {
    private readonly detachedHandles = new Map<string, DetachedRouteHandle>()

    private routeKey(route: ActivatedRouteSnapshot): string | null {
        return route.routeConfig?.path ?? null
    }

    /** Detach every configured view so navigating away stores it rather than destroying it. */
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return this.routeKey(route) !== null
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
        const key = this.routeKey(route)
        if (key === null) {
            return
        }
        if (handle) {
            this.detachedHandles.set(key, handle)
        } else {
            this.detachedHandles.delete(key)
        }
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const key = this.routeKey(route)
        return key !== null && this.detachedHandles.has(key)
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        const key = this.routeKey(route)
        return key === null ? null : (this.detachedHandles.get(key) ?? null)
    }

    /** Same route config → reuse the currently activated instance (Angular default behavior). */
    shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === current.routeConfig
    }
}
