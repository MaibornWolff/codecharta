import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { markedPackagesSelector } from "../../../sharedView/sharedView.facade"

@Injectable({
    providedIn: "root"
})
export class MarkedPackagesStore {
    constructor(private readonly store: Store<CcState>) {}

    markedPackages$ = this.store.select(markedPackagesSelector)
}
