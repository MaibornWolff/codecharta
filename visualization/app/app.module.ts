import "./app" // load AngularJS app first
import "zone.js" // needs to be loaded before "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from "./material/material.module"
import { AttributeSideBarModule } from "./codeCharta/ui/attributeSideBar/attributeSideBar.module"
import { AttributeSideBarComponent } from "./codeCharta/ui/attributeSideBar/attributeSideBar.component"
import { Export3DMapButtonComponent } from "./codeCharta/ui/export3DMapButton/export3DMapButton.component"
import { Export3DMapButtonModule } from "./codeCharta/ui/export3DMapButton/export3DMapButton.module"
import { LabelledColorPickerComponent } from "./codeCharta/ui/labelledColorPicker/labelledColorPicker.component"
import { LegendPanelComponent } from "./codeCharta/ui/legendPanel/legendPanel.component"
import { LegendPanelModule } from "./codeCharta/ui/legendPanel/legendPanel.module"
import { ColorPickerForMapColorModule } from "./codeCharta/ui/colorPickerForMapColor/colorPickerForMapColor.module"
import { ColorPickerForMapColorComponent } from "./codeCharta/ui/colorPickerForMapColor/colorPickerForMapColor.component"
import { FilePanelFileSelectorComponent } from "./codeCharta/ui/filePanel/filePanelFileSelector/filePanelFileSelector.component"
import { FilePanelStateButtonsComponent } from "./codeCharta/ui/filePanel/filePanelStateButtons/filePanelStateButtons.component"
import { FilePanelDeltaSelectorComponent } from "./codeCharta/ui/filePanel/filePanelDeltaSelector/filePanelDeltaSelector.component"
import { EffectsModule } from "./codeCharta/state/angular-redux/effects/effects.module"
import { UnfocusNodesOnLoadingMapEffect } from "./codeCharta/state/effects/unfocusNodesOnLoadingMap.effect"
import { TrackEventUsageDataEffect } from "./codeCharta/state/effects/trackEventUsageData/trackEventUsageData.effect"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "./codeCharta/state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { dialogs } from "./codeCharta/ui/dialogs/dialogs"
import {
	threeSceneServiceProvider,
	codeChartaServiceProvider,
	threeOrbitControlsServiceProvider,
	threeCameraServiceProvider
} from "./codeCharta/services/ajs-upgraded-providers"
import { NodeContextMenuCardModule } from "./codeCharta/state/effects/nodeContextMenu/nodeContextMenuCard/nodeContextMenuCard.module"
import { OpenNodeContextMenuEffect } from "./codeCharta/state/effects/nodeContextMenu/openNodeContextMenu.effect"
import { InvertAreaOptionComponent } from "./codeCharta/ui/areaSettingsPanel/invertAreaOption/invertAreaOption.component"
import { RemoveFileButtonComponent } from "./codeCharta/ui/filePanel/filePanelFileSelector/removeFileButton/removeFileButton.component"
import { FocusButtonsComponent } from "./codeCharta/state/effects/nodeContextMenu/focusButtons/focusButtons.component"
import { IdToBuildingService } from "./codeCharta/services/idToBuilding/idToBuilding.service"
import { LoadingFileProgressSpinnerModule } from "./codeCharta/ui/loadingFileProgressSpinner/loadingFileProgressSpinner.module"
import { LoadingFileProgressSpinnerComponent } from "./codeCharta/ui/loadingFileProgressSpinner/loadingFileProgressSpinner.component"
import { LoadingMapProgressSpinnerModule } from "./codeCharta/ui/toolBar/loadingMapProgressSpinner/loadingMapProgressSpinner.module"
import { LoadingMapProgressSpinnerComponent } from "./codeCharta/ui/toolBar/loadingMapProgressSpinner/loadingMapProgressSpinner.component"
import { BlacklistSearchPatternEffect } from "./codeCharta/ui/searchPanel/searchBar/blacklistSearchPattern.effect"
import { EdgeMetricToggleComponent } from "./codeCharta/ui/edgeSettingsPanel/edgeMetricToggle/edgeMetricToggle.component"
import { SearchPanelComponent } from "./codeCharta/ui/searchPanel/searchPanel.component"
import { SearchPanelModule } from "./codeCharta/ui/searchPanel/searchPanel.module"
import { MetricValueHoveredModule } from "./codeCharta/ui/metricChooser/metricValueHovered/metricValueHovered.module"
import { UploadFilesButtonComponent } from "./codeCharta/ui/toolBar/uploadFilesButton/uploadFilesButton.component"
import { MetricTypeHoveredModule } from "./codeCharta/ui/metricChooser/metricTypeHovered/metricTypeHovered.module"
import { SliderModule } from "./codeCharta/ui/slider/slider.module"
import { HeightSettingsPanelModule } from "./codeCharta/ui/ribbonBar/heightSettingsPanel/heightSettingsPanel.module"
import { ResetSettingsButtonModule } from "./codeCharta/ui/resetSettingsButton/resetSettingsButton.module"
import { CustomConfigsModule } from "./codeCharta/ui/customConfigs/customConfigs.module"

@NgModule({
	imports: [
		BrowserModule,
		UpgradeModule,
		EffectsModule.forRoot([
			UnfocusNodesOnLoadingMapEffect,
			AddBlacklistItemsIfNotResultsInEmptyMapEffect,
			OpenNodeContextMenuEffect,
			TrackEventUsageDataEffect,
			BlacklistSearchPatternEffect
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
		MetricTypeHoveredModule,
		MetricValueHoveredModule,
		CustomConfigsModule,
		HeightSettingsPanelModule,
		ResetSettingsButtonModule
	],
	providers: [
		threeSceneServiceProvider,
		codeChartaServiceProvider,
		IdToBuildingService,
		threeCameraServiceProvider,
		threeOrbitControlsServiceProvider
	],
	declarations: [
		FilePanelFileSelectorComponent,
		FilePanelStateButtonsComponent,
		FilePanelDeltaSelectorComponent,
		InvertAreaOptionComponent,
		EdgeMetricToggleComponent,
		RemoveFileButtonComponent,
		UploadFilesButtonComponent,
		...dialogs
	],
	entryComponents: [
		AttributeSideBarComponent,
		Export3DMapButtonComponent,
		LegendPanelComponent,
		LabelledColorPickerComponent,
		ColorPickerForMapColorComponent,
		FilePanelFileSelectorComponent,
		FilePanelStateButtonsComponent,
		FilePanelDeltaSelectorComponent,
		InvertAreaOptionComponent,
		FocusButtonsComponent,
		RemoveFileButtonComponent,
		LoadingFileProgressSpinnerComponent,
		LoadingMapProgressSpinnerComponent,
		EdgeMetricToggleComponent,
		SearchPanelComponent,
		UploadFilesButtonComponent,
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
