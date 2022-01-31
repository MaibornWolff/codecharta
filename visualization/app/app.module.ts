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
import { FocusButtonsModule } from "./codeCharta/ui/nodeContextMenu/focusButtons/focusButtons.module"
import { FocusButtonsComponent } from "./codeCharta/ui/nodeContextMenu/focusButtons/focusButtons.component"
import { FilePanelFileSelectorComponent } from "./codeCharta/ui/filePanel/filePanelFileSelector/filePanelFileSelector.component"
import { FilePanelStateButtonsComponent } from "./codeCharta/ui/filePanel/filePanelStateButtons/filePanelStateButtons.component"
import { FilePanelDeltaSelectorComponent } from "./codeCharta/ui/filePanel/filePanelDeltaSelector/filePanelDeltaSelector.component"
import { MarkFolderRowComponent } from "./codeCharta/ui/nodeContextMenu/markFolderRow/markFolderRow.component"
import { MarkFolderRowModule } from "./codeCharta/ui/nodeContextMenu/markFolderRow/markFolderRow.module"
import { EffectsModule } from "./codeCharta/state/angular-redux/effects/effects.module"
import { UnfocusNodesOnLoadingMapEffect } from "./codeCharta/state/effects/unfocusNodesOnLoadingMap.effect"
import { FlattenButtonsModule } from "./codeCharta/ui/nodeContextMenu/flattenButtons/flattenButtons.module"
import { FlattenButtonsComponent } from "./codeCharta/ui/nodeContextMenu/flattenButtons/flattenButtons.component"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "./codeCharta/state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { dialogs } from "./codeCharta/ui/dialogs/dialogs"

@NgModule({
	imports: [
		BrowserModule,
		UpgradeModule,
		EffectsModule.forRoot([UnfocusNodesOnLoadingMapEffect, AddBlacklistItemsIfNotResultsInEmptyMapEffect]),
		MapTreeViewModule,
		MatchingFilesCounterModule,
		AttributeSideBarModule,
		MaterialModule,
		FormsModule,
		Export3DMapButtonModule,
		LegendPanelModule,
		ColorPickerForMapColorModule,
		FocusButtonsModule,
		MarkFolderRowModule,
		FlattenButtonsModule
	],
	declarations: [FilePanelFileSelectorComponent, FilePanelStateButtonsComponent, FilePanelDeltaSelectorComponent, ...dialogs],
	entryComponents: [
		MapTreeViewComponent,
		MatchingFilesCounterComponent,
		AttributeSideBarComponent,
		Export3DMapButtonComponent,
		LegendPanelComponent,
		LabelledColorPickerComponent,
		ColorPickerForMapColorComponent,
		FocusButtonsComponent,
		FilePanelFileSelectorComponent,
		FilePanelStateButtonsComponent,
		FilePanelDeltaSelectorComponent,
		FocusButtonsComponent,
		MarkFolderRowComponent,
		FlattenButtonsComponent,
		FlattenButtonsComponent,
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
