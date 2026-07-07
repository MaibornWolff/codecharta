import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { searchedNodePathsSelector } from "../../../renderer/renderModel/renderModel.facade"

@Injectable({
    providedIn: "root"
})
export class SearchedNodePathsStore {
    constructor(private readonly store: Store<CcState>) {}

    searchedNodePaths$ = this.store.select(searchedNodePathsSelector)
}
