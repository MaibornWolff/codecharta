import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import { ApplicationConfig, APP_INITIALIZER } from "@angular/core"
import { provideStore } from "@ngrx/store"
import { provideEffects } from "@ngrx/effects"
import { appReducers, setStateMiddleware } from "app/codeCharta/state/store/state.manager"
import { UnfocusNodesEffect } from "app/codeCharta/state/effects/unfocusNodes/unfocusNodes.effect"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "app/codeCharta/state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { VersionService } from "app/codeCharta/services/version/version.service"
import { CopyToClipboardService } from "app/codeCharta/ui/copyToClipboardButton/copyToClipboard.service"
import { ScenarioService } from "app/codeCharta/ui/ribbonBar/showScenariosButton/scenario.service"
import { FileSelectionModeService } from "app/codeCharta/ui/filePanel/fileSelectionMode.service"
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async"
import { AutoFitCodeMapEffect } from "app/codeCharta/state/effects/autoFitCodeMapChange/autoFitCodeMap.effect"
import { LinkColorMetricToHeightMetricEffect } from "app/codeCharta/state/effects/linkColorMetricToHeightMetric/linkColorMetricToHeightMetric.effect"
import { OpenNodeContextMenuEffect } from "app/codeCharta/state/effects/nodeContextMenu/openNodeContextMenu.effect"
import { RenderCodeMapEffect } from "app/codeCharta/state/effects/renderCodeMapEffect/renderCodeMap.effect"
import { ResetChosenMetricsEffect } from "app/codeCharta/state/effects/resetChosenMetrics/resetChosenMetrics.effect"
import { ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect } from "app/codeCharta/state/effects/resetSelectedEdgeMetricWhenItDoesntExistAnymore/resetSelectedEdgeMetricWhenItDoesntExistAnymore.effect"
import { SaveCcStateEffect } from "app/codeCharta/state/effects/saveCcState/saveCcState.effect"
import { SetLoadingIndicatorEffect } from "app/codeCharta/state/effects/setLoadingIndicator/setLoadingIndicator.effect"
import { UpdateEdgePreviewsEffect } from "app/codeCharta/state/effects/updateEdgePreviews/updateEdgePreviews.effect"
import { UpdateFileSettingsEffect } from "app/codeCharta/state/effects/updateFileSettings/updateFileSettings.effect"
import { UpdateMapColorsEffect } from "app/codeCharta/state/effects/updateMapColors/updateMapColors.effect"
import { UpdateQueryParametersEffect } from "app/codeCharta/state/effects/updateQueryParameters/updateQueryParameters.effect"
import { UpdateVisibleTopLabelsEffect } from "app/codeCharta/state/effects/updateVisibleTopLabels/updateVisibleTopLabels.effect"
import { ResetColorRangeEffect } from "app/codeCharta/state/store/dynamicSettings/colorRange/resetColorRange.effect"
import { BlacklistSearchPatternEffect } from "app/codeCharta/ui/ribbonBar/searchPanel/searchBar/blacklistSearchPattern.effect"

export const appConfig: ApplicationConfig = {
    providers: [
        CopyToClipboardService,
        ScenarioService,
        FileSelectionModeService,
        provideAnimationsAsync(),
        provideHttpClient(withInterceptorsFromDi()),

        provideStore(appReducers, { metaReducers: [setStateMiddleware] }),

        provideEffects([
            UnfocusNodesEffect,
            AddBlacklistItemsIfNotResultsInEmptyMapEffect,
            OpenNodeContextMenuEffect,
            BlacklistSearchPatternEffect,
            ResetColorRangeEffect,
            ResetChosenMetricsEffect,
            UpdateEdgePreviewsEffect,
            RenderCodeMapEffect,
            AutoFitCodeMapEffect,
            UpdateVisibleTopLabelsEffect,
            LinkColorMetricToHeightMetricEffect,
            ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect,
            UpdateFileSettingsEffect,
            SetLoadingIndicatorEffect,
            SaveCcStateEffect,
            UpdateQueryParametersEffect,
            UpdateMapColorsEffect
        ]),

        VersionService,
        {
            provide: APP_INITIALIZER,
            useFactory: (versionService: VersionService) => () => versionService.synchronizeLocalCodeChartaVersion(),
            deps: [VersionService],
            multi: true
        }
    ]
}
