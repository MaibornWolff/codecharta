import "./app" // load AngularJS app first
import "zone.js" // needs to be loaded before "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"

import { MetricDeltaSelectedComponent } from "./codeCharta/ui/metricDeltaSelected/metricDeltaSelected.component"
import { MaterialModule } from "./material/material.module"
import { MapTreeViewModule } from "./codeCharta/ui/mapTreeView/mapTreeView.module"
import { MapTreeViewComponent } from "./codeCharta/ui/mapTreeView/mapTreeView.component"
import { MatchingFilesCounterComponent } from "./codeCharta/ui/matchingFilesCounter/matchingFilesCounter.component"
import { MatchingFilesCounterModule } from "./codeCharta/ui/matchingFilesCounter/matchingFilesCounter.module"
import { NodePathComponent } from "./codeCharta/ui/attributeSideBar/nodePath/nodePath.component"

@NgModule({
	imports: [BrowserModule, UpgradeModule, MaterialModule, MapTreeViewModule, MatchingFilesCounterModule],
	declarations: [MetricDeltaSelectedComponent, NodePathComponent],
	entryComponents: [MapTreeViewComponent, MetricDeltaSelectedComponent, MatchingFilesCounterComponent, NodePathComponent]
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {}
	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
