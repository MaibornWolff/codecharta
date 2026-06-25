import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Injectable({ providedIn: "root" })
export class CodeMapTooltipStore {
    constructor(private readonly state: State<CcState>) {}

    getDynamicSettings() {
        return this.state.getValue().dynamicSettings
    }
}
