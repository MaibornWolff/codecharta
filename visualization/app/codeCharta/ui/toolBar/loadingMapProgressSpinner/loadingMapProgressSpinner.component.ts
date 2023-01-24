import { Component, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../../state/angular-redux/store"
import { isLoadingMapSelector } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.selector"

@Component({
	selector: "cc-loading-map-progress-spinner",
	templateUrl: "./loadingMapProgressSpinner.component.html",
	styleUrls: ["./loadingMapProgressSpinner.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class LoadingMapProgressSpinnerComponent {
	isLoadingMap$: Observable<boolean>

	constructor(store: Store) {
		this.isLoadingMap$ = store.select(isLoadingMapSelector)
	}
}
