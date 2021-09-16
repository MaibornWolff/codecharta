import "./app" // load AngularJS app first
import "zone.js" // needs to be loaded before "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"

import { SortingButtonComponent } from "./codeCharta/ui/sortingButton/sortingButton.component"
import { MetricDeltaSelectedComponent } from "./codeCharta/ui/metricDeltaSelected/metricDeltaSelected.component"
import { MapTreeViewLevelItemIcon } from "./codeCharta/ui/mapTreeView/mapTreeViewLevelItemIcon/mapTreeViewLevelItemIcon.component"
import { MapTreeViewLevelItemIconClassPipe } from "./codeCharta/ui/mapTreeView/mapTreeViewLevelItemIcon/mapTreeViewLevelItemIconClass.pipe"
import { MapTreeViewLevelItemIconColorPipe } from "./codeCharta/ui/mapTreeView/mapTreeViewLevelItemIcon/mapTreeViewLevelItemIconColor.pipe"
import { MapTreeViewLevelItemContent } from "./codeCharta/ui/mapTreeView/mapTreeViewLevelItemIcon/mapTreeViewLevelItemContent.component"

@NgModule({
	imports: [BrowserModule, UpgradeModule],
	declarations: [
		SortingButtonComponent,
		MetricDeltaSelectedComponent,
		MapTreeViewLevelItemIcon,
		MapTreeViewLevelItemContent,
		MapTreeViewLevelItemIconClassPipe,
		MapTreeViewLevelItemIconColorPipe
	],
	entryComponents: [SortingButtonComponent, MetricDeltaSelectedComponent, MapTreeViewLevelItemIcon, MapTreeViewLevelItemContent]
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {}
	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
