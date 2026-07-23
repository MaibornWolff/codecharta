import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from "@angular/router"

export class KeepAliveRouteReuseStrategy implements RouteReuseStrategy {
    private readonly detachedHandles = new Map<string, DetachedRouteHandle>()

    private routeKey(route: ActivatedRouteSnapshot): string | null {
        return route.routeConfig?.path ?? null
    }

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

    shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === current.routeConfig
    }
}
