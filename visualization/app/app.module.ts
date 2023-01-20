import { APP_INITIALIZER, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { HttpClientModule } from "@angular/common/http"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from "./material/material.module"
import { EffectsModule } from "./codeCharta/state/angular-redux/effects/effects.module"
import { UnfocusNodesEffect } from "./codeCharta/state/effects/unfocusNodes/unfocusNodes.effect"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "./codeCharta/state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { dialogs } from "./codeCharta/ui/dialogs/dialogs"
import { OpenNodeContextMenuEffect } from "./codeCharta/state/effects/nodeContextMenu/openNodeContextMenu.effect"
import { BlacklistSearchPatternEffect } from "./codeCharta/ui/searchPanel/searchBar/blacklistSearchPattern.effect"
import { ResetColorRangeEffect } from "./codeCharta/state/store/dynamicSettings/colorRange/resetColorRange.effect"
import { ResetDynamicMarginEffect } from "./codeCharta/state/effects/resetDynamicMargin/resetDynamicMargin.effect"
import { ResetChosenMetricsEffect } from "./codeCharta/state/effects/resetChosenMetrics/resetChosenMetrics.effect"
import { UpdateEdgePreviewsEffect } from "./codeCharta/state/effects/updateEdgePreviews/updateEdgePreviews.effect"
import { ChangelogDialogModule } from "./codeCharta/ui/dialogs/changelogDialog/changelogDialog.module"
import { VersionService } from "./codeCharta/services/version/version.service"
import { RenderCodeMapEffect } from "./codeCharta/state/effects/renderCodeMapEffect/renderCodeMap.effect"
import { AutoFitCodeMapEffect } from "./codeCharta/state/effects/autoFitCodeMapChange/autoFitCodeMap.effect"
import { CodeChartaModule } from "./codeCharta/codeCharta.module"
import { UpdateVisibleTopLabelsEffect } from "./codeCharta/state/effects/updateVisibleTopLabels/updateVisibleTopLabels.effect"
import { ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect } from "./codeCharta/state/effects/resetSelectedEdgeMetricWhenItDoesntExistAnymore/resetSelectedEdgeMetricWhenItDoesntExistAnymore.effect"
import { LinkColorMetricToHeightMetricEffect } from "./codeCharta/state/effects/linkColorMetricToHeightMetric/linkColorMetricToHeightMetric.effect"
import { UpdateFileSettingsEffect } from "./codeCharta/state/effects/updateFileSettings/updateFileSettings.effect"
import { CodeChartaComponent } from "./codeCharta/codeCharta.component"
import { NodeContextMenuCardModule } from "./codeCharta/state/effects/nodeContextMenu/nodeContextMenuCard/nodeContextMenuCard.module"

@NgModule({
	imports: [
		BrowserModule,
		HttpClientModule,
		EffectsModule.forRoot([
			UnfocusNodesEffect,
			AddBlacklistItemsIfNotResultsInEmptyMapEffect,
			OpenNodeContextMenuEffect,
			BlacklistSearchPatternEffect,
			ResetColorRangeEffect,
			ResetDynamicMarginEffect,
			ResetChosenMetricsEffect,
			UpdateEdgePreviewsEffect,
			RenderCodeMapEffect,
			AutoFitCodeMapEffect,
			UpdateVisibleTopLabelsEffect,
			LinkColorMetricToHeightMetricEffect,
			ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect,
			UpdateFileSettingsEffect
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

platformBrowserDynamic().bootstrapModule(AppModule)
