import "./app" // load angularjs first
import "zone.js" // needed to be laoded before  "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"
import { AttributionComponent } from "./codeCharta/components/attribution/attribution.component"

@NgModule({
	imports: [BrowserModule, UpgradeModule],
	declarations: [AttributionComponent],
	entryComponents: [AttributionComponent] // this key can be removed after angularjs isn't the main entry point anymore
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule) {}
	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
