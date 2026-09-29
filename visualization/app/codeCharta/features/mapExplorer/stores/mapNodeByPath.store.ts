import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable, take } from "rxjs"
import { CcState, CodeMapNode } from "../../../model/codeCharta.model"
import { createNodeByPathSelector } from "../../../renderer/renderModel/renderModel.facade"

@Injectable({ providedIn: "root" })
export class MapNodeByPathStore {
    private readonly store = inject<Store<CcState>>(Store)

    currentNodeAt(nodePath: string): Observable<CodeMapNode | undefined> {
        return this.store.select(createNodeByPathSelector(nodePath)).pipe(take(1))
    }
}
