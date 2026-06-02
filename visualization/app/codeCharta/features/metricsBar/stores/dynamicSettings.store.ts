import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"

@Injectable({
    providedIn: "root"
})
export class DynamicSettingsStore {
    constructor(private readonly store: Store<CcState>) {}

    dynamicSettings$ = this.store.select(dynamicSettingsSelector)
}
