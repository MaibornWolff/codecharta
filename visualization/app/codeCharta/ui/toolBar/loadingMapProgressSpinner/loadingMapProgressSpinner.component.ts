import "./loadingMapProgressSpinner.component.scss"
import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../../state/angular-redux/store"
import { isLoadingMapSelector } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.selector"

@Component({
	selector: "cc-loading-map-progress-spinner",
	template: require("./loadingMapProgressSpinner.component.html")
})
export class LoadingMapProgressSpinnerComponent {
	isLoadingMap$: Observable<boolean>

	constructor(@Inject(Store) store: Store) {
		this.isLoadingMap$ = store.select(isLoadingMapSelector)
	}
}
