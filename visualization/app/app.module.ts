import "./app" // load angularjs first
import "zone.js" // needs to be laoded before "@angular/core"
import { Inject, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { UpgradeModule } from "@angular/upgrade/static"
import { NgReduxModule, NgRedux } from "@angular-redux/store"

import { CcReduxStore, Store } from "./codeCharta/state/store/store"
import { SortingButtonComponent } from "./codeCharta/ui/sortingButton/sortingButton.component"

@NgModule({
	imports: [BrowserModule, UpgradeModule, NgReduxModule],
	declarations: [SortingButtonComponent],
	entryComponents: [SortingButtonComponent]
})
export class AppModule {
	constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule, @Inject(NgRedux) ngRedux: CcReduxStore) {
		// Todo angular-migration: Note that currently ngRedux.dispatch is monkey patched within store.service
		ngRedux.provideStore(Store.store)
	}
	ngDoBootstrap() {
		this.upgrade.bootstrap(document.body, ["app"], { strictDi: true })
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
