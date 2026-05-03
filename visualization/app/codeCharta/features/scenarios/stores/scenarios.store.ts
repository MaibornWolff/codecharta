import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

@Injectable({ providedIn: "root" })
export class ScenariosStore {
    constructor(private readonly state: State<CcState>) {}

    getValue(): CcState {
        return this.state.getValue()
    }
}
