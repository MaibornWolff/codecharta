import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setSelectedBuildingId } from "../../../stores/sharedView/sharedView.write.facade"

/** The single write the word cloud performs: clearing the selection back to the whole map. */
@Injectable({ providedIn: "root" })
export class WordCloudWriteStore {
    private readonly store: Store<CcState> = inject(Store)

    clearSelectedBuilding() {
        this.store.dispatch(setSelectedBuildingId({ value: null }))
    }
}
