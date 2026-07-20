/**
 * @jest-environment-options {"url": "http://localhost:9009/index.html?file=fileOne.json&area=functions"}
 */
import { LocationStrategy } from "@angular/common"
import { Component, provideZonelessChangeDetection } from "@angular/core"
import { bootstrapApplication } from "@angular/platform-browser"
import { provideRouter, Router, RouterOutlet } from "@angular/router"
import { locationStrategyProvider } from "app/app.config"
import { QueryParamsService } from "app/codeCharta/util/queryParameter/queryParams.service"
import { routeLinks, routePaths } from "./routePaths"

@Component({ selector: "cc-routing-host", template: "<router-outlet></router-outlet>", imports: [RouterOutlet] })
class RoutingHostComponent {}

// Stubs for the real views, whose deep ngrx dependencies are irrelevant to URL ownership.
@Component({ selector: "cc-metrics-view-stub", template: "metrics" })
class MetricsViewStubComponent {}

@Component({ selector: "cc-domain-view-stub", template: "domain" })
class DomainViewStubComponent {}

const stubRoutes = [
    { path: routePaths.metrics, component: MetricsViewStubComponent },
    { path: routePaths.domain, component: DomainViewStubComponent }
]

/**
 * Guards the `?file=…` deep link against the router.
 *
 * Two things here are LOAD-BEARING; without either, these tests pass vacuously and would NOT have caught
 * the regression they exist for:
 *
 * 1. The `<base href="./" />` — what `app/index.html` really ships. It strips the query string from
 *    `document.baseURI`, which is what made the stock `withHashLocation()` strategy resolve its relative
 *    "#/" write into "…/" and wipe the query.
 * 2. `bootstrapApplication` rather than `TestBed`. TestBed substitutes a `MockPlatformLocation`, so a
 *    TestBed-based router test never touches `window.location` and reports success no matter what the
 *    strategy writes.
 */
describe("QueryPreservingHashLocationStrategy", () => {
    let queryParamsService: QueryParamsService
    let router: Router
    let locationStrategy: LocationStrategy

    beforeEach(async () => {
        // Arrange
        const base = document.createElement("base")
        base.setAttribute("href", "./")
        document.head.append(base)
        document.body.append(document.createElement("cc-routing-host"))

        const applicationRef = await bootstrapApplication(RoutingHostComponent, {
            providers: [provideZonelessChangeDetection(), provideRouter(stubRoutes), locationStrategyProvider]
        })
        router = applicationRef.injector.get(Router)
        queryParamsService = applicationRef.injector.get(QueryParamsService)
        locationStrategy = applicationRef.injector.get(LocationStrategy)
    })

    afterEach(() => {
        document.head.querySelector("base")?.remove()
        document.body.replaceChildren()
    })

    it("should leave the url query parameters readable after the initial navigation", () => {
        // Act
        const fileNames = queryParamsService.getFileNames()

        // Assert
        expect(queryParamsService.hasFile()).toBe(true)
        expect(fileNames).toEqual(["fileOne.json"])
        expect(queryParamsService.getMetrics().areaMetric).toBe("functions")
    })

    it("should leave the url query parameters readable after switching to the domain view and back", async () => {
        // Act
        await router.navigateByUrl(routeLinks.domain)
        await router.navigateByUrl(routeLinks.metrics, { replaceUrl: true })

        // Assert
        expect(queryParamsService.hasFile()).toBe(true)
        expect(queryParamsService.getMetrics().areaMetric).toBe("functions")
    })

    // A relative "#/domain" href resolves against `document.baseURI`, which `<base href="./" />` strips the
    // query from — so ctrl+click, middle-click and "copy link address" on the view switcher would lose the
    // deep link. Left-click hides this, because `RouterLink` intercepts it and uses the history writers.
    it("should render router links as absolute hrefs that keep the query parameters", () => {
        // Arrange
        const anchor = document.createElement("a")

        // Act
        anchor.setAttribute("href", locationStrategy.prepareExternalUrl(routeLinks.domain))

        // Assert
        expect(anchor.href).toBe("http://localhost:9009/index.html?file=fileOne.json&area=functions#/domain")
    })

    it("should keep the routed path in the fragment and the parameters in the query string", async () => {
        // Act
        await router.navigateByUrl(routeLinks.domain)

        // Assert
        expect(window.location.hash).toBe("#/domain")
        expect(window.location.pathname).toBe("/index.html")
        expect(window.location.search).toBe("?file=fileOne.json&area=functions")
    })
})
