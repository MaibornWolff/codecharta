import { Injectable } from "@angular/core"
import { CcState } from "../../../model/codeCharta.model"
import { labelsPerMapActiveSelector } from "../../../renderer/renderModel/renderModel.facade"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"

@Injectable({
    providedIn: "root"
})
export class StateAccessStore {
    constructor(private readonly ccStateSnapshot: CcStateSnapshot) {}

    getValue(): CcState {
        return this.ccStateSnapshot.get()
    }

    isLabelsPerMapActive(): boolean {
        return labelsPerMapActiveSelector(this.ccStateSnapshot.get())
    }
}
