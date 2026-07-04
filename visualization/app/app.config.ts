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
import { SaveCcStateEffect } from "app/codeCharta/state/effects/saveCcState/saveCcState.effect"
import { UpdateFileSettingsEffect } from "app/codeCharta/state/effects/updateFileSettings/updateFileSettings.effect"
import { UpdateQueryParametersEffect } from "app/codeCharta/state/effects/updateQueryParameters/updateQueryParameters.effect"
import { UpdateVisibleTopLabelsEffect } from "app/codeCharta/state/effects/updateVisibleTopLabels/updateVisibleTopLabels.effect"
import { BlacklistSearchPatternEffect } from "app/codeCharta/state/effects/blacklistSearchPattern/blacklistSearchPattern.effect"
import { BlacklistExtensionEffect } from "./codeCharta/state/effects/blacklistExtension/blacklistExtension.effect"

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptorsFromDi()),

        provideStore(appReducers, { metaReducers: [setStateMiddleware] }),

        provideEffects([
            ...codeMapEffects,
            ...metricsBarEffects,
            UnfocusNodesEffect,
            AddBlacklistItemsIfNotResultsInEmptyMapEffect,
            BlacklistSearchPatternEffect,
            BlacklistExtensionEffect,
            UpdateVisibleTopLabelsEffect,
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
