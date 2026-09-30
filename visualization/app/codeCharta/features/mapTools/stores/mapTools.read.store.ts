import { Injectable } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../model/codeCharta.model"
import { centerMapZoomSelector, defaultCenterMapZoom } from "../../../stores/preferences/preferences.read.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"

@Injectable({ providedIn: "root" })
export class MapToolsReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly defaultCenterMapZoom = defaultCenterMapZoom
    readonly centerMapZoom = toSignal(this.store.select(centerMapZoomSelector), { requireSync: true })
    readonly isFocused = toSignal(this.store.select(currentFocusedNodePathSelector).pipe(map(Boolean)), { requireSync: true })
}
