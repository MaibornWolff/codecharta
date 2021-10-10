import "./app" // load AngularJS app first
import "zone.js" // needs to be loaded before "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"

import { SortingButtonComponent } from "./codeCharta/ui/sortingButton/sortingButton.component"
import { MapTreeViewItemIcon } from "./codeCharta/ui/mapTreeView/mapTreeViewItemIcon/mapTreeViewItemIcon.component"
import { MapTreeViewItemIconClassPipe } from "./codeCharta/ui/mapTreeView/mapTreeViewItemIcon/mapTreeViewItemIconClass.pipe"
import { MapTreeViewItemIconColorPipe } from "./codeCharta/ui/mapTreeView/mapTreeViewItemIcon/mapTreeViewItemIconColor.pipe"
import { MapTreeViewItemOptionButtonsComponent } from "./codeCharta/ui/mapTreeView/mapTreeViewItemOptionButtons/mapTreeViewItemOptionButtons.component"
import { MapTreeViewItemName } from "./codeCharta/ui/mapTreeView/mapTreeViewItemName/mapTreeViewItemName.component"
import { MapTreeViewItemSearchedNameHighlightPipe } from "./codeCharta/ui/mapTreeView/mapTreeViewItemName/mapTreeViewItemSearchedNameHighlight.pipe"
import { IsNodeLeafPipe } from "./codeCharta/ui/mapTreeView/mapTreeViewItemName/isNodeLeaf.pipe"
import { MapTreeViewLevel } from "./codeCharta/ui/mapTreeView/mapTreeViewLevel/mapTreeViewLevel.component"

@NgModule({
	imports: [BrowserModule, UpgradeModule],
	declarations: [
		SortingButtonComponent,
		MapTreeViewItemIcon,
		MapTreeViewItemIconClassPipe,
		MapTreeViewItemIconColorPipe,
		MapTreeViewItemOptionButtonsComponent,
		MapTreeViewItemName,
		MapTreeViewLevel,
		MapTreeViewItemSearchedNameHighlightPipe,
		IsNodeLeafPipe
	],
	entryComponents: [
		SortingButtonComponent,
		MapTreeViewItemIcon,
		MapTreeViewItemOptionButtonsComponent,
		MapTreeViewItemName,
		MapTreeViewLevel
	]
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {}
	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
