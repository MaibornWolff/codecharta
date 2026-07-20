import { ActivatedRouteSnapshot, DetachedRouteHandle } from "@angular/router"
import { KeepAliveRouteReuseStrategy } from "./keepAliveRouteReuse.strategy"

describe("KeepAliveRouteReuseStrategy", () => {
    let strategy: KeepAliveRouteReuseStrategy

    const routeFor = (path: string | undefined): ActivatedRouteSnapshot =>
        ({ routeConfig: path === undefined ? null : { path } }) as unknown as ActivatedRouteSnapshot

    beforeEach(() => {
        strategy = new KeepAliveRouteReuseStrategy()
    })

    it("should detach a configured route so it is kept alive", () => {
        expect(strategy.shouldDetach(routeFor("domain"))).toBe(true)
    })

    it("should not detach a route without a path config", () => {
        expect(strategy.shouldDetach(routeFor(undefined))).toBe(false)
    })

    it("should store and retrieve a detached handle by route path", () => {
        // Arrange
        const handle = {} as DetachedRouteHandle

        // Act
        strategy.store(routeFor("domain"), handle)

        // Assert
        expect(strategy.shouldAttach(routeFor("domain"))).toBe(true)
        expect(strategy.retrieve(routeFor("domain"))).toBe(handle)
    })

    it("should not attach a route that was never stored", () => {
        expect(strategy.shouldAttach(routeFor(""))).toBe(false)
        expect(strategy.retrieve(routeFor(""))).toBeNull()
    })

    it("should drop a stored handle when storing null", () => {
        // Arrange
        strategy.store(routeFor("domain"), {} as DetachedRouteHandle)

        // Act
        strategy.store(routeFor("domain"), null)

        // Assert
        expect(strategy.shouldAttach(routeFor("domain"))).toBe(false)
    })

    it("should reuse the route only when the route config is identical", () => {
        // Arrange
        const metrics = routeFor("")
        const domain = routeFor("domain")

        // Act & Assert
        expect(strategy.shouldReuseRoute(metrics, metrics)).toBe(true)
        expect(strategy.shouldReuseRoute(metrics, domain)).toBe(false)
    })
})
