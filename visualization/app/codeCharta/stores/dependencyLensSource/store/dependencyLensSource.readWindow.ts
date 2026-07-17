import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState, DependencyLensSource } from "../../../model/codeCharta.model"
import { edgeAttributeTypesSelector } from "./attributeTypes/attributeTypes.selector"

@Injectable({
    providedIn: "root"
})
export class DependencyLensSourceReadWindow {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly edgeAttributeTypes$ = this.store.select(edgeAttributeTypesSelector)

    getDependencyLensSource(): DependencyLensSource {
        return this.state.getValue().dependencyLensSource
    }
}
