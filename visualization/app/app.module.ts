import "./app" // load AngularJS app first
import "zone.js" // needs to be loaded before "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"
import { FormsModule } from "@angular/forms"

import { MetricDeltaSelectedComponent } from "./codeCharta/ui/metricDeltaSelected/metricDeltaSelected.component"
import { MaterialModule } from "./material/material.module"
import { MapTreeViewModule } from "./codeCharta/ui/mapTreeView/mapTreeView.module"
import { MapTreeViewComponent } from "./codeCharta/ui/mapTreeView/mapTreeView.component"
import { MatchingFilesCounterComponent } from "./codeCharta/ui/matchingFilesCounter/matchingFilesCounter.component"
import { MatchingFilesCounterModule } from "./codeCharta/ui/matchingFilesCounter/matchingFilesCounter.module"
import { NodePathComponent } from "./codeCharta/ui/attributeSideBar/nodePath/nodePath.component"
import { FilePanelFileSelectorComponent } from "./codeCharta/ui/filePanel/filePanelFileSelector/filePanelFileSelector.component"
import { FilePanelStateButtonsComponent } from "./codeCharta/ui/filePanel/filePanelStateButtons/filePanelStateButtons.component"
import { FilePanelDeltaSelectorComponent } from "./codeCharta/ui/filePanel/filePanelDeltaSelector/filePanelDeltaSelector.component"

@NgModule({
	imports: [BrowserModule, UpgradeModule, MaterialModule, MapTreeViewModule, MatchingFilesCounterModule, FormsModule],
	declarations: [
		MetricDeltaSelectedComponent,
		NodePathComponent,
		FilePanelFileSelectorComponent,
		FilePanelStateButtonsComponent,
		FilePanelDeltaSelectorComponent
	],
	entryComponents: [
		MapTreeViewComponent,
		MetricDeltaSelectedComponent,
		MatchingFilesCounterComponent,
		NodePathComponent,
		FilePanelFileSelectorComponent,
		FilePanelStateButtonsComponent,
		FilePanelDeltaSelectorComponent
	]
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {}
	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
