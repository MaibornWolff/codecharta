import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setCenterMapZoom, setPresentationMode } from "../../../stores/preferences/preferences.write.facade"

@Injectable({ providedIn: "root" })
export class ViewCubeToolboxWriteStore {
    constructor(private readonly store: Store<CcState>) {}

    setPresentationMode(value: boolean) {
        this.store.dispatch(setPresentationMode({ value }))
    }

    setCenterMapZoom(value: number) {
        this.store.dispatch(setCenterMapZoom({ value }))
    }
}
