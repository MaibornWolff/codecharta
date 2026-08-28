import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"
import { CodeMapNode, SortingOption } from "../../model/codeCharta.model"

export interface ExplorerTree {
    rootNodeFor(sortingOrder: SortingOption, sortingOrderAscending: boolean): Observable<CodeMapNode | undefined>
}

export const EXPLORER_TREE = new InjectionToken<ExplorerTree>("EXPLORER_TREE")
