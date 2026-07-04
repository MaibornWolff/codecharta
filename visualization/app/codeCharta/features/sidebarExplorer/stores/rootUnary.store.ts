import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { rootUnarySelector } from "../../../renderModel/renderModel.facade"

@Injectable({
    providedIn: "root"
})
export class RootUnaryStore {
    constructor(private readonly store: Store<CcState>) {}

    rootUnary$ = this.store.select(rootUnarySelector)
}
