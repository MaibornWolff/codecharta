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
import { AttributeTypeSelectorModule } from "./codeCharta/ui/attributeTypeSelector/attributeTypeSelector.module"
import { AttributeTypeSelectorComponent } from "./codeCharta/ui/attributeTypeSelector/attributeTypeSelector.component"
import { AttributeSideBarHeaderSectionComponent } from "./codeCharta/ui/attributeSideBar/attributeSideBarHeaderSection/attributeSideBarHeaderSection.component"
import { AttributeSideBarHeaderSectionModule } from "./codeCharta/ui/attributeSideBar/attributeSideBarHeaderSection/attributeSideBarHeaderSection.module"

@NgModule({
	imports: [
		BrowserModule,
		UpgradeModule,
		MaterialModule,
		MapTreeViewModule,
		MatchingFilesCounterModule,
		AttributeTypeSelectorModule,
		AttributeSideBarHeaderSectionModule
	],
	declarations: [MetricDeltaSelectedComponent],
	entryComponents: [
		MapTreeViewComponent,
		MetricDeltaSelectedComponent,
		MatchingFilesCounterComponent,
		AttributeSideBarHeaderSectionComponent,
		AttributeTypeSelectorComponent
	]
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {}
	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
