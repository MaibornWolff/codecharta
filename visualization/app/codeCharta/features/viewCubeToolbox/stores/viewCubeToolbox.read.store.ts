import { Injectable } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { centerMapZoomSelector, defaultCenterMapZoom } from "../../../stores/preferences/preferences.read.facade"

@Injectable({ providedIn: "root" })
export class ViewCubeToolboxReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly defaultCenterMapZoom = defaultCenterMapZoom
    readonly centerMapZoom = toSignal(this.store.select(centerMapZoomSelector), { requireSync: true })
}
