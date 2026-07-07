import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { metricDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { filesSelector } from "../../../stores/fileStore/fileStore.facade"

@Injectable({ providedIn: "root" })
export class ScenarioDialogStore {
    constructor(private readonly store: Store<CcState>) {}

    files$ = this.store.select(filesSelector)
    metricData$ = this.store.select(metricDataSelector)
}
