import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState, RecursivePartial } from "../../../model/codeCharta.model"
import { setIsLoadingFile } from "../../../stores/fileStore/fileStore.facade"
import { setIsLoadingMap } from "../../../stores/mapState/mapState.write.facade"
import { setState } from "../../../stores/rootStore/state.actions"

@Injectable({ providedIn: "root" })
export class ScenariosStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    getValue(): CcState {
        return this.state.getValue()
    }

    setIsLoadingFile(value: boolean) {
        this.store.dispatch(setIsLoadingFile({ value }))
    }

    setIsLoadingMap(value: boolean) {
        this.store.dispatch(setIsLoadingMap({ value }))
    }

    setStatePatch(value: RecursivePartial<CcState>) {
        this.store.dispatch(setState({ value }))
    }
}
