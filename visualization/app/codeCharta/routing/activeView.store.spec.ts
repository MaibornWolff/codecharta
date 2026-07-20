import { NavigationEnd, Router } from "@angular/router"
import { Subject } from "rxjs"
import { ActiveViewStore } from "./activeView.store"
import { routeLinks } from "./routePaths"

describe("ActiveViewStore", () => {
    let events$: Subject<NavigationEnd>
    let router: { url: string; events: Subject<NavigationEnd> }

    const navigateTo = (url: string) => {
        router.url = url
        events$.next(new NavigationEnd(1, url, url))
    }

    beforeEach(() => {
        events$ = new Subject<NavigationEnd>()
        router = { url: routeLinks.metrics, events: events$ }
    })

    const createStore = () => new ActiveViewStore(router as unknown as Router)

    it("should report the metrics view for the default route", () => {
        // Assert
        expect(createStore().currentView()).toBe("metrics")
    })

    it("should report the domain view for the domain route", () => {
        // Arrange
        router.url = routeLinks.domain

        // Assert
        expect(createStore().currentView()).toBe("domain")
    })

    it("should ignore the query string, which the router does not own", () => {
        // Arrange
        router.url = `${routeLinks.domain}?file=some.cc.json`

        // Assert
        expect(createStore().currentView()).toBe("domain")
    })

    it("should emit the current view immediately and again on every navigation", () => {
        // Arrange
        const store = createStore()
        const emissions: string[] = []
        store.activeView$.subscribe(view => emissions.push(view))

        // Act
        navigateTo(routeLinks.domain)
        navigateTo(routeLinks.metrics)

        // Assert
        expect(emissions).toEqual(["metrics", "domain", "metrics"])
    })

    it("should not emit again when a navigation lands on the view that is already active", () => {
        // Arrange
        const store = createStore()
        const emissions: string[] = []
        store.activeView$.subscribe(view => emissions.push(view))

        // Act — a query-string-only change still fires a NavigationEnd
        navigateTo(`${routeLinks.metrics}?file=other.cc.json`)

        // Assert
        expect(emissions).toEqual(["metrics"])
    })
})
