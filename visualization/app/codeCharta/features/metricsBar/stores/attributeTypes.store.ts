import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { attributeTypesSelector } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.selector"

@Injectable({
    providedIn: "root"
})
export class AttributeTypesStore {
    constructor(private readonly store: Store<CcState>) {}

    attributeTypes$ = this.store.select(attributeTypesSelector)
}
