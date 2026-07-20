/**
 * @jest-environment-options {"url": "http://localhost:9009/index.html?file=fileOne.json&area=functions"}
 */
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

// Stubs for the real views, whose deep ngrx/three.js dependencies are irrelevant to URL ownership.
@Component({ selector: "cc-metrics-view-stub", template: "metrics" })
class MetricsViewStubComponent {}

@Component({ selector: "cc-domain-view-stub", template: "domain" })
class DomainViewStubComponent {}

const stubComponentByPath = {
    [routePaths.metrics]: MetricsViewStubComponent,
    [routePaths.domain]: DomainViewStubComponent
}

/** The app's REAL route table with only the view components stubbed, so a renamed path breaks these tests. */
const stubbedRoutes: Route[] = routes.map(route => ({ ...route, component: stubComponentByPath[route.path] }))

// Must mirror the @jest-environment-options url at the top of this file.
const deepLinkPathname = "/index.html"
const deepLinkQueryString = "?file=fileOne.json&area=functions"

/**
 * The headline URL contract of the domain view: switching Map → Domain → Map must leave the `?file=…`
 * deep link in the URL untouched, so a reload — or a shared link — still boots the deep-linked file.
 *
 * The contract only exists end-to-end, so three things here are LOAD-BEARING; drop any one of them and
 * these tests pass vacuously:
 *
 * 1. `bootstrapApplication` rather than `TestBed`. TestBed substitutes a `MockPlatformLocation`, so a
 *    TestBed-based router test never touches `window.location` and reports success no matter what the
 *    router writes.
 * 2. The `<base href="./" />` that `app/index.html` really ships. It strips the query string from
 *    `document.baseURI`, which is what made the stock `withHashLocation()` strategy resolve its relative
 *    "#/" write into "…/" and wipe the query.
 * 3. `locationStrategyProvider` — the app's own QueryPreservingHashLocationStrategy. Providing the router
 *    without it is exactly the regression under guard (see app.config's hash-location note).
 *
 * The switch is driven by clicking the real ViewSwitcherComponent's routerLinks — the navigation the user
 * actually performs — rather than by calling the router directly.
 */
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
        // fail for the wrong reason (each test must start from the url the @jest-environment-options set)
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
        // Tear the bootstrapped app down: it is a REAL application (not TestBed), so without this each test
        // leaves a live router subscribed to the shared jsdom document's popstate/hashchange, and the next
        // test's navigations are observed by every app bootstrapped before it.
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
