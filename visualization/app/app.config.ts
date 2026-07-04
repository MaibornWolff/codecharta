import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import { ApplicationConfig, APP_INITIALIZER } from "@angular/core"
import { provideStore } from "@ngrx/store"
import { provideEffects } from "@ngrx/effects"
import { appReducers, setStateMiddleware } from "app/codeCharta/state/store/state.manager"
import { UnfocusNodesEffect } from "app/codeCharta/state/effects/unfocusNodes/unfocusNodes.effect"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "app/codeCharta/state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { ChangelogFacade } from "app/codeCharta/features/changelog/facade"
import { codeMapEffects } from "app/codeCharta/features/codeMap/effects/codeMap.effects"
import { metricsBarEffects } from "app/codeCharta/features/metricsBar/effects/metricsBar.effects"
import { labelSettingsEffects } from "app/codeCharta/features/labelSettings/effects/labelSettings.effects"
import { sidebarExplorerEffects } from "app/codeCharta/features/sidebarExplorer/effects/sidebarExplorer.effects"
import { fileExtensionBarEffects } from "app/codeCharta/features/fileExtensionBar/effects/fileExtensionBar.effects"
import { SaveCcStateEffect } from "app/codeCharta/state/effects/saveCcState/saveCcState.effect"
import { UpdateFileSettingsEffect } from "app/codeCharta/state/effects/updateFileSettings/updateFileSettings.effect"
import { UpdateQueryParametersEffect } from "app/codeCharta/state/effects/updateQueryParameters/updateQueryParameters.effect"

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptorsFromDi()),

        provideStore(appReducers, { metaReducers: [setStateMiddleware] }),

        provideEffects([
            ...codeMapEffects,
            ...metricsBarEffects,
            ...labelSettingsEffects,
            ...sidebarExplorerEffects,
            ...fileExtensionBarEffects,
            UnfocusNodesEffect,
            AddBlacklistItemsIfNotResultsInEmptyMapEffect,
            UpdateFileSettingsEffect,
            SaveCcStateEffect,
            UpdateQueryParametersEffect
        ]),

        {
            provide: APP_INITIALIZER,
            useFactory: (changelogFacade: ChangelogFacade) => () => changelogFacade.synchronizeVersion(),
            deps: [ChangelogFacade],
            multi: true
        }
    ]
}
