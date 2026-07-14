import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../model/codeCharta.model"

/**
 * The only surface outside a state home that may read the whole state tree synchronously. A read of a
 * single home's slice goes through that home's read window instead.
 */
@Injectable({ providedIn: "root" })
export class CcStateSnapshot {
    constructor(private readonly state: State<CcState>) {}

    get(): CcState {
        return this.state.getValue()
    }
}
