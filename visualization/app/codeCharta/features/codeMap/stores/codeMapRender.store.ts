import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState, ColorLabelOptions } from "../../../codeCharta.model"
import { isLoadingFileSelector } from "../../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"

@Injectable({ providedIn: "root" })
export class CodeMapRenderStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly isLoadingFile$ = this.store.select(isLoadingFileSelector)

    getState(): CcState {
        return this.state.getValue()
    }

    setColorLabels(value: Partial<ColorLabelOptions>) {
        this.store.dispatch(setColorLabels({ value }))
    }
}
