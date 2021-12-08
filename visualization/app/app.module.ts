import "./app" // load AngularJS app first
import "zone.js" // needs to be loaded before "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"

import { MapTreeViewModule } from "./codeCharta/ui/mapTreeView/mapTreeView.module"
import { MapTreeViewComponent } from "./codeCharta/ui/mapTreeView/mapTreeView.component"
import { MatchingFilesCounterComponent } from "./codeCharta/ui/matchingFilesCounter/matchingFilesCounter.component"
import { MatchingFilesCounterModule } from "./codeCharta/ui/matchingFilesCounter/matchingFilesCounter.module"
import { AttributeSideBarModule } from "./codeCharta/ui/attributeSideBar/attributeSideBar.module"
import { AttributeSideBarComponent } from "./codeCharta/ui/attributeSideBar/attributeSideBar.component"
import { Export3DMapButtonComponent } from "./codeCharta/ui/stlExportButton/export3DMapButton.component"
import { Export3DMapButtonModule } from "./codeCharta/ui/stlExportButton/export3DMapButton.module"

@NgModule({
	imports: [BrowserModule, UpgradeModule, MapTreeViewModule, MatchingFilesCounterModule, AttributeSideBarModule, Export3DMapButtonModule],
	declarations: [],
	entryComponents: [MapTreeViewComponent, MatchingFilesCounterComponent, AttributeSideBarComponent, Export3DMapButtonComponent]
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {}
	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
