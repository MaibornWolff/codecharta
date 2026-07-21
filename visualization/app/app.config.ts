import { LocationStrategy } from "@angular/common"
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import { APP_INITIALIZER, ApplicationConfig } from "@angular/core"
import { provideRouter, RouteReuseStrategy, Routes } from "@angular/router"
import { provideEffects } from "@ngrx/effects"
import { provideStore } from "@ngrx/store"
import { ChangelogFacade } from "app/codeCharta/features/changelog/facade"
import { codeMapEffects } from "app/codeCharta/features/codeMap/effects/codeMap.effects"
import { fileExtensionBarEffects } from "app/codeCharta/features/fileExtensionBar/effects/fileExtensionBar.effects"
import { labelSettingsEffects } from "app/codeCharta/features/labelSettings/effects/labelSettings.effects"
import { metricsBarEffects } from "app/codeCharta/features/metricsBar/effects/metricsBar.effects"
import { navBarEffects } from "app/codeCharta/features/navBar/effects/navBar.effects"
import { sharedEffects } from "app/codeCharta/features/shared/effects/shared.effects"
import { sidebarExplorerEffects } from "app/codeCharta/features/sidebarExplorer/effects/sidebarExplorer.effects"
import { loadEffects } from "app/codeCharta/load/effects/load.effects"
import { KeepAliveRouteReuseStrategy } from "app/codeCharta/routing/keepAliveRouteReuse.strategy"
import { QueryPreservingHashLocationStrategy } from "app/codeCharta/routing/queryPreservingHashLocation.strategy"
import { routePaths } from "app/codeCharta/routing/routePaths"
import { appReducers, setStateMiddleware } from "app/codeCharta/stores/rootStore/store"
import { DomainViewComponent } from "app/codeCharta/views/domainView/domainView.component"
import { domainViewEffects } from "app/codeCharta/views/domainView/effects/domainView.effects"
import { MetricsViewComponent } from "app/codeCharta/views/metricsView/metricsView.component"

// The metrics (3D map) view is the default path; the domain (word-cloud) view is a sibling route. The
// routed path lives in the URL FRAGMENT (`withHashLocation`), not in the pathname, for two reasons:
//
// 1. The published entry is `…/app/index.html?file=…`. `Location.normalize` only strips a trailing
//    "/index.html" (its regex is $-anchored), so with path routing a trailing query string leaves the
//    location as "/index.html?file=…" — matching no route, so the outlet stays empty. (Entries without a
//    query — Electron's `loadFile(…/index.html)`, the e2e static server's "/" — did resolve correctly.)
// 2. The app is served from static hosting that cannot rewrite unknown paths, so reloading "/domain" 404s.
//    A fragment is never sent to the server.
//
// Ownership of the URL is split with QueryParamsService: the router only ever rewrites the FRAGMENT, that
// service only ever rewrites the QUERY STRING, so the ?file=… deep link survives a metrics↔domain switch
// without any router-level query handling.
//
// That split only holds with QueryPreservingHashLocationStrategy in place of the stock
// `withHashLocation()`: Angular's HashLocationStrategy writes a fragment-only RELATIVE url ("#/"), which
// `replaceState` resolves against `document.baseURI` — and `<base href="./" />` in index.html strips the
// query from baseURI, so the stock strategy destroyed `?file=…` on the first navigation. See the strategy.
export const routes: Routes = [
    { path: routePaths.metrics, component: MetricsViewComponent },
    { path: routePaths.domain, component: DomainViewComponent }
]

/** Replaces the stock `withHashLocation()` strategy — see QueryPreservingHashLocationStrategy. */
export const locationStrategyProvider = { provide: LocationStrategy, useClass: QueryPreservingHashLocationStrategy }

/** The complete router wiring — always provide these together; the strategy is not optional. */
export const routerProviders = [provideRouter(routes), locationStrategyProvider] as const

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptorsFromDi()),

        provideStore(appReducers, { metaReducers: [setStateMiddleware] }),

        ...routerProviders,

        // Keep the metrics (3D map) and domain views alive across a switch — see the strategy's doc.
        { provide: RouteReuseStrategy, useClass: KeepAliveRouteReuseStrategy },

        provideEffects([
            ...codeMapEffects,
            ...metricsBarEffects,
            ...labelSettingsEffects,
            ...sidebarExplorerEffects,
            ...fileExtensionBarEffects,
            ...navBarEffects,
            ...sharedEffects,
            ...loadEffects,
            ...domainViewEffects
        ]),

        {
            provide: APP_INITIALIZER,
            useFactory: (changelogFacade: ChangelogFacade) => () => changelogFacade.synchronizeVersion(),
            deps: [ChangelogFacade],
            multi: true
        }
    ]
}
