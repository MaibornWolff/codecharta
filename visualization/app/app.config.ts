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
import { loadEffects } from "app/codeCharta/load/effects/load.effects"
import { KeepAliveRouteReuseStrategy } from "app/codeCharta/routing/keepAliveRouteReuse.strategy"
import { QueryPreservingHashLocationStrategy } from "app/codeCharta/routing/queryPreservingHashLocation.strategy"
import { routePaths } from "app/codeCharta/routing/routePaths"
import { appReducers, setStateMiddleware } from "app/codeCharta/stores/rootStore/store"
import { domainViewEffects } from "app/codeCharta/views/domainView/effects/domainView.effects"
import { metricsViewEffects } from "app/codeCharta/views/metricsView/effects/metricsView.effects"
import { MetricsViewComponent } from "app/codeCharta/views/metricsView/metricsView.component"

export const routes: Routes = [
    { path: routePaths.metrics, component: MetricsViewComponent },
    // Lazy: the domain view is the only thing that pulls in echarts, which no metric-view user needs.
    {
        path: routePaths.domain,
        loadComponent: () => import("app/codeCharta/views/domainView/domainView.component").then(m => m.DomainViewComponent)
    }
]

export const locationStrategyProvider = { provide: LocationStrategy, useClass: QueryPreservingHashLocationStrategy }

export const routerProviders = [provideRouter(routes), locationStrategyProvider] as const

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptorsFromDi()),

        provideStore(appReducers, { metaReducers: [setStateMiddleware] }),

        ...routerProviders,

        { provide: RouteReuseStrategy, useClass: KeepAliveRouteReuseStrategy },

        provideEffects([
            ...codeMapEffects,
            ...metricsBarEffects,
            ...labelSettingsEffects,
            ...fileExtensionBarEffects,
            ...navBarEffects,
            ...sharedEffects,
            ...loadEffects,
            ...domainViewEffects,
            ...metricsViewEffects
        ]),

        {
            provide: APP_INITIALIZER,
            useFactory: (changelogFacade: ChangelogFacade) => () => changelogFacade.synchronizeVersion(),
            deps: [ChangelogFacade],
            multi: true
        }
    ]
}
