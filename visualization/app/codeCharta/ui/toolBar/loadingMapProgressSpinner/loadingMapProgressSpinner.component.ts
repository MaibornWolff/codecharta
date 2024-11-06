import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { isLoadingMapSelector } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.selector"
import { MatProgressSpinner } from "@angular/material/progress-spinner"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-loading-map-progress-spinner",
    templateUrl: "./loadingMapProgressSpinner.component.html",
    styleUrls: ["./loadingMapProgressSpinner.component.scss"],
    standalone: true,
    imports: [MatProgressSpinner, AsyncPipe]
})
export class LoadingMapProgressSpinnerComponent {
    isLoadingMap$: Observable<boolean>

    constructor(store: Store<CcState>) {
        this.isLoadingMap$ = store.select(isLoadingMapSelector)
    }
}
