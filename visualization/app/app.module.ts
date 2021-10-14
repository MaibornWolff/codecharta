import "./app" // load AngularJS app first
import "zone.js" // needs to be loaded before "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"

import { SortingButtonComponent } from "./codeCharta/ui/sortingButton/sortingButton.component"
import { MapTreeViewLevel } from "./codeCharta/ui/mapTreeView/mapTreeViewLevel/mapTreeViewLevel.component"
import { MapTreeViewLevelModule } from "./codeCharta/ui/mapTreeView/mapTreeViewLevel.module"
import { MetricDeltaSelectedComponent } from "./codeCharta/ui/metricDeltaSelected/metricDeltaSelected.component"

@NgModule({
	imports: [BrowserModule, UpgradeModule, MapTreeViewLevelModule],
	declarations: [SortingButtonComponent, MetricDeltaSelectedComponent],
	entryComponents: [SortingButtonComponent, MapTreeViewLevel, MetricDeltaSelectedComponent]
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {}
	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
