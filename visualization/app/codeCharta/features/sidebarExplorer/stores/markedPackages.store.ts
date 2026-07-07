import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { markedPackagesSelector } from "../../../stores/sharedView/sharedView.read.facade"

@Injectable({
    providedIn: "root"
})
export class MarkedPackagesStore {
    constructor(private readonly store: Store<CcState>) {}

    markedPackages$ = this.store.select(markedPackagesSelector)
}
