import "./app" // load AngularJS app first
import "zone.js" // needs to be loaded before "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"
import { MatSelectModule } from "@angular/material/select"

import { SortingButtonComponent } from "./codeCharta/ui/sortingButton/sortingButton.component"
import { MapTreeViewModule } from "./codeCharta/ui/mapTreeView/mapTreeView.module"
import { MetricDeltaSelectedComponent } from "./codeCharta/ui/metricDeltaSelected/metricDeltaSelected.component"
import { MapTreeViewComponent } from "./codeCharta/ui/mapTreeView/mapTreeView.component"
import { SortingOptionComponent } from "./codeCharta/ui/sortingOption/sortingOption.component"

@NgModule({
	imports: [BrowserModule, BrowserAnimationsModule, UpgradeModule, MapTreeViewModule, MatSelectModule],
	declarations: [SortingButtonComponent, MetricDeltaSelectedComponent, SortingOptionComponent],
	entryComponents: [SortingButtonComponent, MapTreeViewComponent, MetricDeltaSelectedComponent, SortingOptionComponent]
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {}
	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
