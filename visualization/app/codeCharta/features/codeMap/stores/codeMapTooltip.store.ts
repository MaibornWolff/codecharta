import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Injectable({ providedIn: "root" })
export class CodeMapTooltipStore {
    constructor(private readonly state: State<CcState>) {}

    // Slice 10b: dynamicSettings was dissolved into the preferences home. This read historically pulled
    // from dynamicSettings, which since Slice 7 no longer carries the metric names the tooltip destructures
    // (they come through undefined) — reading the preferences home preserves that exact behavior.
    getDynamicSettings() {
        return this.state.getValue().preferences
    }
}
