import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { isLoadingMapSelector } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.selector"

@Component({
    selector: "cc-loading-map-progress-spinner",
    templateUrl: "./loadingMapProgressSpinner.component.html",
    styleUrls: ["./loadingMapProgressSpinner.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class LoadingMapProgressSpinnerComponent {
    isLoadingMap$: Observable<boolean>

    constructor(store: Store<CcState>) {
        this.isLoadingMap$ = store.select(isLoadingMapSelector)
    }
}
