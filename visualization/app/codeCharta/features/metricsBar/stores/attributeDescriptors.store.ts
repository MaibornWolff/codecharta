import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

@Injectable({
    providedIn: "root"
})
export class AttributeDescriptorsStore {
    constructor(private readonly store: Store<CcState>) {}

    attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
}
