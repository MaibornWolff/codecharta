import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { labelsPerMapActiveSelector } from "../../../renderer/renderModel/renderModel.facade"

@Injectable({
    providedIn: "root"
})
export class StateAccessStore {
    constructor(private readonly state: State<CcState>) {}

    getValue(): CcState {
        return this.state.getValue()
    }

    isLabelsPerMapActive(): boolean {
        return labelsPerMapActiveSelector(this.state.getValue())
    }
}
