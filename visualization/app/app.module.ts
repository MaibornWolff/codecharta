import "@angular/compiler" // todo this is needed for JIT compiler for ngColor within a downgraded component. Latest after full migration we can likely remove it again
import "./app" // load AngularJS app first
import "zone.js" // needs to be loaded before "@angular/core"
import { APP_INITIALIZER, Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from "./material/material.module"
import { AttributeSideBarModule } from "./codeCharta/ui/attributeSideBar/attributeSideBar.module"
import { AttributeSideBarComponent } from "./codeCharta/ui/attributeSideBar/attributeSideBar.component"
import { Export3DMapButtonComponent } from "./codeCharta/ui/export3DMapButton/export3DMapButton.component"
import { Export3DMapButtonModule } from "./codeCharta/ui/export3DMapButton/export3DMapButton.module"
import { LegendPanelComponent } from "./codeCharta/ui/legendPanel/legendPanel.component"
import { LegendPanelModule } from "./codeCharta/ui/legendPanel/legendPanel.module"
import { ColorPickerForMapColorModule } from "./codeCharta/ui/colorPickerForMapColor/colorPickerForMapColor.module"
import { EffectsModule } from "./codeCharta/state/angular-redux/effects/effects.module"
import { UnfocusNodesOnLoadingMapEffect } from "./codeCharta/state/effects/unfocusNodesOnLoadingMap/unfocusNodesOnLoadingMap.effect"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "./codeCharta/state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { dialogs } from "./codeCharta/ui/dialogs/dialogs"
import {
	codeChartaServiceProvider,
	threeCameraServiceProvider,
	threeOrbitControlsServiceProvider,
	threeRendererServiceProvider,
	threeSceneServiceProvider
} from "./codeCharta/services/ajs-upgraded-providers"
import { NodeContextMenuCardModule } from "./codeCharta/state/effects/nodeContextMenu/nodeContextMenuCard/nodeContextMenuCard.module"
import { OpenNodeContextMenuEffect } from "./codeCharta/state/effects/nodeContextMenu/openNodeContextMenu.effect"
import { FocusButtonsComponent } from "./codeCharta/state/effects/nodeContextMenu/focusButtons/focusButtons.component"
import { IdToBuildingService } from "./codeCharta/services/idToBuilding/idToBuilding.service"
import { LoadingFileProgressSpinnerModule } from "./codeCharta/ui/loadingFileProgressSpinner/loadingFileProgressSpinner.module"
import { LoadingFileProgressSpinnerComponent } from "./codeCharta/ui/loadingFileProgressSpinner/loadingFileProgressSpinner.component"
import { LoadingMapProgressSpinnerModule } from "./codeCharta/ui/toolBar/loadingMapProgressSpinner/loadingMapProgressSpinner.module"
import { LoadingMapProgressSpinnerComponent } from "./codeCharta/ui/toolBar/loadingMapProgressSpinner/loadingMapProgressSpinner.component"
import { BlacklistSearchPatternEffect } from "./codeCharta/ui/searchPanel/searchBar/blacklistSearchPattern.effect"
import { SearchPanelComponent } from "./codeCharta/ui/searchPanel/searchPanel.component"
import { SearchPanelModule } from "./codeCharta/ui/searchPanel/searchPanel.module"
import { UploadFilesButtonModule } from "./codeCharta/ui/toolBar/uploadFilesButton/uploadFilesButton.module"
import { SliderModule } from "./codeCharta/ui/slider/slider.module"
import { HeightSettingsPanelModule } from "./codeCharta/ui/ribbonBar/heightSettingsPanel/heightSettingsPanel.module"
import { FilePanelModule } from "./codeCharta/ui/filePanel/filePanel.module"
import { CustomConfigsModule } from "./codeCharta/ui/customConfigs/customConfigs.module"
import { ResetColorRangeEffect } from "./codeCharta/state/store/dynamicSettings/colorRange/resetColorRange.effect"
import { CenterMapButtonModule } from "./codeCharta/ui/viewCube/centerMapButton/centerMapButton.module"
import { GlobalConfigurationButtonModule } from "./codeCharta/ui/toolBar/globalConfigurationButton/globalConfigurationButton.module"
import { FileExtensionBarModule } from "./codeCharta/ui/fileExtensionBar/fileExtensionBar.module"
import { AreaSettingsPanelModule } from "./codeCharta/ui/ribbonBar/areaSettingsPanel/areaSettingsPanel.module"
import { ResetDynamicMarginEffect } from "./codeCharta/state/effects/resetDynamicMargin/resetDynamicMargin.effect"
import { MetricChooserModule } from "./codeCharta/ui/metricChooser/metricChooser.module"
import { ResetChosenMetricsEffect } from "./codeCharta/state/effects/resetChosenMetrics/resetChosenMetrics.effect"
import { RibbonBarModule } from "./codeCharta/ui/ribbonBar/ribbonBar.module"
import { UpdateEdgePreviewsEffect } from "./codeCharta/state/effects/updateEdgePreviews/updateEdgePreviews.effect"
import { ChangelogDialogModule } from "./codeCharta/ui/dialogs/changelogDialog/changelogDialog.module"
import { VersionService } from "./codeCharta/services/version/version.service"
import { HoveredNodePathPanelModule } from "./codeCharta/ui/toolBar/hoveredNodePathPanel/hoveredNodePathPanel.module"
import { ActionIconModule } from "./codeCharta/ui/actionIcon/actionIcon.module"
import { ColorSettingsPanelModule } from "./codeCharta/ui/ribbonBar/colorSettingsPanel/colorSettingsPanel.module"
import { ScreenshotButtonModule } from "./codeCharta/ui/screenshotButton/screenshotButton.module"
import { SplitStateActionsEffect } from "./codeCharta/state/effects/splitStateActionsEffect/splitStateActions.effect"
import { CopyToClipboardButtonModule } from "./codeCharta/ui/copyToClipboardButton/copyToClipboardButton.module"
import { DownloadButtonModule } from "./codeCharta/ui/toolBar/downloadButton/downloadButton.module"

@NgModule({
	imports: [
		BrowserModule,
		UpgradeModule,
		EffectsModule.forRoot([
			SplitStateActionsEffect,
			UnfocusNodesOnLoadingMapEffect,
			AddBlacklistItemsIfNotResultsInEmptyMapEffect,
			OpenNodeContextMenuEffect,
			BlacklistSearchPatternEffect,
			ResetColorRangeEffect,
			ResetDynamicMarginEffect,
			ResetChosenMetricsEffect,
			UpdateEdgePreviewsEffect
		]),
		SliderModule,
		AttributeSideBarModule,
		MaterialModule,
		FormsModule,
		Export3DMapButtonModule,
		LegendPanelModule,
		ColorPickerForMapColorModule,
		NodeContextMenuCardModule,
		ReactiveFormsModule,
		LoadingFileProgressSpinnerModule,
		LoadingMapProgressSpinnerModule,
		SearchPanelModule,
		CustomConfigsModule,
		FilePanelModule,
		HeightSettingsPanelModule,
		CenterMapButtonModule,
		GlobalConfigurationButtonModule,
		FileExtensionBarModule,
		AreaSettingsPanelModule,
		MetricChooserModule,
		RibbonBarModule,
		ChangelogDialogModule,
		HoveredNodePathPanelModule,
		ActionIconModule,
		ColorSettingsPanelModule,
		ScreenshotButtonModule,
		DownloadButtonModule,
		UploadFilesButtonModule,
		CopyToClipboardButtonModule
	],
	providers: [
		threeSceneServiceProvider,
		codeChartaServiceProvider,
		IdToBuildingService,
		threeCameraServiceProvider,
		threeOrbitControlsServiceProvider,
		threeRendererServiceProvider,
		VersionService,
		{
			provide: APP_INITIALIZER,
			useFactory: (config: VersionService) => () => config.synchronizeLocalCodeChartaVersion(),
			deps: [VersionService],
			multi: true
		}
	],
	declarations: [...dialogs],
	entryComponents: [
		AttributeSideBarComponent,
		Export3DMapButtonComponent,
		LegendPanelComponent,
		FocusButtonsComponent,
		LoadingFileProgressSpinnerComponent,
		LoadingMapProgressSpinnerComponent,
		SearchPanelComponent,
		...dialogs
	]
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {}

	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
