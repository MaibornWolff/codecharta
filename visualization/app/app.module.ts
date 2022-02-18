import "./app" // load AngularJS app first
import "zone.js" // needs to be loaded before "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"
import { FormsModule } from "@angular/forms"
import { MaterialModule } from "./material/material.module"
import { MapTreeViewModule } from "./codeCharta/ui/mapTreeView/mapTreeView.module"
import { MapTreeViewComponent } from "./codeCharta/ui/mapTreeView/mapTreeView.component"
import { MatchingFilesCounterComponent } from "./codeCharta/ui/matchingFilesCounter/matchingFilesCounter.component"
import { MatchingFilesCounterModule } from "./codeCharta/ui/matchingFilesCounter/matchingFilesCounter.module"
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
import { threeSceneServiceProvider } from "./codeCharta/services/ajs-upgraded-providers"
import { NodeContextMenuCardModule } from "./codeCharta/state/effects/nodeContextMenu/nodeContextMenuCard/nodeContextMenuCard.module"
import { OpenNodeContextMenuEffect } from "./codeCharta/state/effects/nodeContextMenu/openNodeContextMenu.effect"
import { InvertAreaOptionComponent } from "./codeCharta/ui/areaSettingsPanel/invertAreaOption/invertAreaOption.component"
import { RemoveFileButtonComponent } from "./codeCharta/ui/filePanel/filePanelFileSelector/removeFileButton/removeFileButton.component"
import { FocusButtonsComponent } from "./codeCharta/state/effects/nodeContextMenu/focusButtons/focusButtons.component"
import { MarkFolderRowComponent } from "./codeCharta/state/effects/nodeContextMenu/markFolderRow/markFolderRow.component"
import { IdToBuildingService } from "./codeCharta/services/idToBuilding/idToBuilding.service"
import { LoadingFileProgressSpinnerModule } from "./codeCharta/ui/loadingFileProgressSpinner/loadingFileProgressSpinner.module"
import { LoadingFileProgressSpinnerComponent } from "./codeCharta/ui/loadingFileProgressSpinner/loadingFileProgressSpinner.component"
import { LoadingMapProgressSpinnerModule } from "./codeCharta/ui/toolBar/loadingMapProgressSpinner/loadingMapProgressSpinner.module"
import { LoadingMapProgressSpinnerComponent } from "./codeCharta/ui/toolBar/loadingMapProgressSpinner/loadingMapProgressSpinner.component"

@NgModule({
	imports: [
		BrowserModule,
		UpgradeModule,
		EffectsModule.forRoot([
			UnfocusNodesOnLoadingMapEffect,
			AddBlacklistItemsIfNotResultsInEmptyMapEffect,
			OpenNodeContextMenuEffect,
			TrackEventUsageDataEffect
		]),
		MapTreeViewModule,
		MatchingFilesCounterModule,
		AttributeSideBarModule,
		MaterialModule,
		FormsModule,
		Export3DMapButtonModule,
		LegendPanelModule,
		ColorPickerForMapColorModule,
		NodeContextMenuCardModule,
		LoadingFileProgressSpinnerModule,
		LoadingMapProgressSpinnerModule
	],
	providers: [threeSceneServiceProvider, IdToBuildingService],
	declarations: [
		FilePanelFileSelectorComponent,
		FilePanelStateButtonsComponent,
		FilePanelDeltaSelectorComponent,
		InvertAreaOptionComponent,
		RemoveFileButtonComponent,
		...dialogs
	],
	entryComponents: [
		MapTreeViewComponent,
		MatchingFilesCounterComponent,
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
		MarkFolderRowComponent,
		RemoveFileButtonComponent,
		LoadingFileProgressSpinnerComponent,
		LoadingMapProgressSpinnerComponent,
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
