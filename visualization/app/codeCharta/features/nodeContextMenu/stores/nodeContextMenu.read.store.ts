import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { hasDomainDataSelector } from "../../../lenses/domain/domainLens.facade"
import { CcState } from "../../../model/codeCharta.model"
import { rightClickedCodeMapNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { currentMarkColorSelector, markFolderItemsSelector } from "../selectors/markFolderItems.selector"

@Injectable({
    providedIn: "root"
})
export class NodeContextMenuReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly rightClickedCodeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)
    readonly markFolderItems$ = this.store.select(markFolderItemsSelector)
    readonly currentMarkColor$ = this.store.select(currentMarkColorSelector)
    readonly hasDomainData$ = this.store.select(hasDomainDataSelector)
}
