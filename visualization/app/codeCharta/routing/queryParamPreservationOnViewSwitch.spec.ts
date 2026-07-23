import { ApplicationRef, Component, provideZonelessChangeDetection } from "@angular/core"
import { bootstrapApplication } from "@angular/platform-browser"
import { NavigationEnd, provideRouter, Route, Router, RouterOutlet } from "@angular/router"
import { provideMockStore } from "@ngrx/store/testing"
import { locationStrategyProvider, routes } from "app/app.config"
import { ViewSwitcherComponent } from "app/codeCharta/features/navBar/components/viewSwitcher/viewSwitcher.component"
import { hasDomainDataSelector } from "app/codeCharta/lenses/domain/domainLens.facade"
import { defaultState } from "app/codeCharta/stores/rootStore/state.manager"
import { QueryParamsService } from "app/codeCharta/util/queryParameter/queryParams.service"
import { firstValueFrom } from "rxjs"
import { filter } from "rxjs/operators"
import { routeLinks, routePaths } from "./routePaths"

@Component({
    selector: "cc-view-switch-host",
    template: "<cc-view-switcher></cc-view-switcher><router-outlet></router-outlet>",
    imports: [ViewSwitcherComponent, RouterOutlet]
})
class ViewSwitchHostComponent {}

@Component({ selector: "cc-metrics-view-stub", template: "metrics" })
class MetricsViewStubComponent {}

@Component({ selector: "cc-domain-view-stub", template: "domain" })
class DomainViewStubComponent {}

const stubComponentByPath = {
    [routePaths.metrics]: MetricsViewStubComponent,
    [routePaths.domain]: DomainViewStubComponent
}

const stubbedRoutes: Route[] = routes.map(route => ({ ...route, component: stubComponentByPath[route.path] }))

const deepLinkPathname = "/index.html"
const deepLinkQueryString = "?file=fileOne.json&area=functions"

describe("query parameter preservation on a view switch", () => {
    let router: Router
    let queryParamsService: QueryParamsService
    let host: HTMLElement
    let applicationRef: ApplicationRef

    const switchTo = async (view: "metrics" | "domain") => {
        const navigated = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)))
        host.querySelector<HTMLAnchorElement>(`[data-testid="view-switcher-${view}"]`).click()
        await navigated
    }

    beforeEach(async () => {
        // Arrange — restore the deep link, so a preceding test's navigation cannot make this one pass or
        window.history.replaceState(null, "", `${deepLinkPathname}${deepLinkQueryString}`)

        const base = document.createElement("base")
        base.setAttribute("href", "./")
        document.head.append(base)
        host = document.createElement("cc-view-switch-host")
        document.body.append(host)

        applicationRef = await bootstrapApplication(ViewSwitchHostComponent, {
            providers: [
                provideZonelessChangeDetection(),
                provideRouter(stubbedRoutes),
                locationStrategyProvider,
                provideMockStore({ initialState: defaultState, selectors: [{ selector: hasDomainDataSelector, value: true }] })
            ]
        })
        router = applicationRef.injector.get(Router)
        queryParamsService = applicationRef.injector.get(QueryParamsService)
    })

    afterEach(() => {
        applicationRef?.destroy()
        document.head.querySelector("base")?.remove()
        document.body.replaceChildren()
    })

    it("should keep the file query parameter in the url after switching from the map to the domain view and back", async () => {
        // Arrange — the deep link is in the url before anything is clicked
        expect(window.location.search).toBe(deepLinkQueryString)

        // Act
        await switchTo("domain")
        const searchOnDomainView = window.location.search
        await switchTo("metrics")

        // Assert — the query string survives BOTH legs, and the router still owns only the fragment
        expect(searchOnDomainView).toBe(deepLinkQueryString)
        expect(window.location.search).toBe(deepLinkQueryString)
        expect(window.location.pathname).toBe("/index.html")
        expect(window.location.hash).toBe("#/")
        expect(router.url).toBe(routeLinks.metrics)
    })

    it("should still resolve the deep linked file and metrics after switching from the map to the domain view and back", async () => {
        // Act
        await switchTo("domain")
        await switchTo("metrics")

        // Assert — what the app actually reads the url for
        expect(queryParamsService.hasFile()).toBe(true)
        expect(queryParamsService.getFileNames()).toEqual(["fileOne.json"])
        expect(queryParamsService.getMetrics().areaMetric).toBe("functions")
    })
})
