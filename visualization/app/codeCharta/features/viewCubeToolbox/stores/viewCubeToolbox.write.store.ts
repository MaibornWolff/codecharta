import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setPresentationMode } from "../../../stores/preferences/preferences.write.facade"

@Injectable({ providedIn: "root" })
export class ViewCubeToolboxWriteStore {
    constructor(private readonly store: Store<CcState>) {}

    setPresentationMode(value: boolean) {
        this.store.dispatch(setPresentationMode({ value }))
    }
}
