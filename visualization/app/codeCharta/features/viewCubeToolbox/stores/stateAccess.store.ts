import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"

@Injectable({ providedIn: "root" })
export class StateAccessStore {
    constructor(private readonly state: State<CcState>) {}

    getFiles(): FileState[] {
        return this.state.getValue().files
    }
}
