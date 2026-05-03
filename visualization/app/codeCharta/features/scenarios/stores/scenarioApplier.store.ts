import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState, RecursivePartial } from "../../../codeCharta.model"
import { setIsLoadingFile } from "../../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { setState } from "../../../state/store/state.actions"

@Injectable({ providedIn: "root" })
export class ScenarioApplierStore {
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
