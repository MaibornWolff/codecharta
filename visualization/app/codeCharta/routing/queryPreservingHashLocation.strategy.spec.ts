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

@Component({ selector: "cc-metrics-view-stub", template: "metrics" })
class MetricsViewStubComponent {}

@Component({ selector: "cc-domain-view-stub", template: "domain" })
class DomainViewStubComponent {}

const stubRoutes = [
    { path: routePaths.metrics, component: MetricsViewStubComponent },
    { path: routePaths.domain, component: DomainViewStubComponent }
]

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
