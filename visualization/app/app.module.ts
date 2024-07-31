import { HttpClientModule } from "@angular/common/http"
import { APP_INITIALIZER, NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { EffectsModule } from "@ngrx/effects"
import { StoreModule } from "@ngrx/store"
import { CodeChartaComponent } from "./codeCharta/codeCharta.component"
import { CodeChartaModule } from "./codeCharta/codeCharta.module"
import { VersionService } from "./codeCharta/services/version/version.service"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "./codeCharta/state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { AutoFitCodeMapEffect } from "./codeCharta/state/effects/autoFitCodeMapChange/autoFitCodeMap.effect"
import { LinkColorMetricToHeightMetricEffect } from "./codeCharta/state/effects/linkColorMetricToHeightMetric/linkColorMetricToHeightMetric.effect"
import { NodeContextMenuCardModule } from "./codeCharta/state/effects/nodeContextMenu/nodeContextMenuCard/nodeContextMenuCard.module"
import { OpenNodeContextMenuEffect } from "./codeCharta/state/effects/nodeContextMenu/openNodeContextMenu.effect"
import { RenderCodeMapEffect } from "./codeCharta/state/effects/renderCodeMapEffect/renderCodeMap.effect"
import { ResetChosenMetricsEffect } from "./codeCharta/state/effects/resetChosenMetrics/resetChosenMetrics.effect"
import { ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect } from "./codeCharta/state/effects/resetSelectedEdgeMetricWhenItDoesntExistAnymore/resetSelectedEdgeMetricWhenItDoesntExistAnymore.effect"
import { SaveCcStateEffect } from "./codeCharta/state/effects/saveCcState/saveCcState.effect"
import { SaveMetricsInQueryParametersEffect } from "./codeCharta/state/effects/saveMetricsInQueryParameters/saveMetricsInQueryParameters.effect"
import { SetLoadingIndicatorEffect } from "./codeCharta/state/effects/setLoadingIndicator/setLoadingIndicator.effect"
import { UnfocusNodesEffect } from "./codeCharta/state/effects/unfocusNodes/unfocusNodes.effect"
import { UpdateEdgePreviewsEffect } from "./codeCharta/state/effects/updateEdgePreviews/updateEdgePreviews.effect"
import { UpdateFileSettingsEffect } from "./codeCharta/state/effects/updateFileSettings/updateFileSettings.effect"
import { UpdateMapColorsEffect } from "./codeCharta/state/effects/updateMapColors/updateMapColors.effect"
import { UpdateVisibleTopLabelsEffect } from "./codeCharta/state/effects/updateVisibleTopLabels/updateVisibleTopLabels.effect"
import { ResetColorRangeEffect } from "./codeCharta/state/store/dynamicSettings/colorRange/resetColorRange.effect"
import { appReducers, setStateMiddleware } from "./codeCharta/state/store/state.manager"
import { ChangelogDialogModule } from "./codeCharta/ui/dialogs/changelogDialog/changelogDialog.module"
import { dialogs } from "./codeCharta/ui/dialogs/dialogs"
import { BlacklistSearchPatternEffect } from "./codeCharta/ui/searchPanel/searchBar/blacklistSearchPattern.effect"
import { MaterialModule } from "./material/material.module"
import { cameraZoomFactorEffect } from "./codeCharta/state/store/appStatus/cameraZoomFactor/cameraZoomFactor.effect"

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
        EffectsModule.forRoot([
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
            SaveMetricsInQueryParametersEffect,
            UpdateMapColorsEffect,
            cameraZoomFactorEffect
        ]),
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        ChangelogDialogModule,
        CodeChartaModule,
        NodeContextMenuCardModule
    ],
    providers: [
        VersionService,
        {
            provide: APP_INITIALIZER,
            useFactory: (config: VersionService) => () => config.synchronizeLocalCodeChartaVersion(),
            deps: [VersionService],
            multi: true
        }
    ],
    declarations: [...dialogs],
    bootstrap: [CodeChartaComponent]
})
export class AppModule {}

if (typeof window !== "undefined" && !window["__TEST_ENVIRONMENT__"]) {
    platformBrowserDynamic().bootstrapModule(AppModule)
}
