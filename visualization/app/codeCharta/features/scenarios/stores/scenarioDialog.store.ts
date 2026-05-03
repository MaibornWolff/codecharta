import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { filesSelector } from "../../../state/store/files/files.selector"

@Injectable({ providedIn: "root" })
export class ScenarioDialogStore {
    constructor(private readonly store: Store<CcState>) {}

    files$ = this.store.select(filesSelector)
    metricData$ = this.store.select(metricDataSelector)
}
