import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { rootUnarySelector } from "../../../renderer/renderModel/renderModel.facade"

@Injectable({
    providedIn: "root"
})
export class RootUnaryStore {
    constructor(private readonly store: Store<CcState>) {}

    rootUnary$ = this.store.select(rootUnarySelector)
}
