import { HashLocationStrategy, LocationStrategy } from "@angular/common"
import { TestBed } from "@angular/core/testing"
import { routeLinks, routePaths } from "app/codeCharta/routing/routePaths"
import { DomainViewComponent } from "app/codeCharta/views/domainView/domainView.component"
import { MetricsViewComponent } from "app/codeCharta/views/metricsView/metricsView.component"
import { routerProviders, routes } from "./app.config"

describe("app routes", () => {
    it("should render the metrics view at the default path", () => {
        // Arrange & Act
        const defaultRoute = routes.find(route => route.path === routePaths.metrics)

        // Assert
        expect(defaultRoute?.component).toBe(MetricsViewComponent)
    })

    it("should lazy load the domain view at the domain path", async () => {
        // Arrange & Act
        const domainRoute = routes.find(route => route.path === routePaths.domain)

        // Assert
        expect(domainRoute?.component).toBeUndefined()
        expect(await domainRoute?.loadComponent?.()).toBe(DomainViewComponent)
    })

    it("should keep the routed path in the fragment so file and static-host entry URLs resolve", () => {
        // Arrange
        TestBed.configureTestingModule({ providers: [...routerProviders] })

        // Act
        const locationStrategy = TestBed.inject(LocationStrategy)

        // Assert
        expect(locationStrategy).toBeInstanceOf(HashLocationStrategy)
        expect(new URL(locationStrategy.prepareExternalUrl(routeLinks.domain)).hash).toBe("#/domain")
    })
})
