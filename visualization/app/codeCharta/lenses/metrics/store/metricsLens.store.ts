import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { nodeAttributeDescriptorsSelector, nodeAttributeTypesSelector } from "./attributes.selectors"

@Injectable({ providedIn: "root" })
export class MetricsLensStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly attributeDescriptors$ = this.store.select(nodeAttributeDescriptorsSelector)
    readonly attributeTypes$ = this.store.select(nodeAttributeTypesSelector)

    getAttributeDescriptors() {
        return nodeAttributeDescriptorsSelector(this.state.getValue())
    }

    getAttributeTypes() {
        return nodeAttributeTypesSelector(this.state.getValue())
    }
}
