import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState, DomainState } from "../../../model/codeCharta.model"
import { wordCloudSettingsSelector } from "./wordCloudSettings.selector"

@Injectable({
    providedIn: "root"
})
export class DomainStateReadWindow {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly wordCloudSettings$ = this.store.select(wordCloudSettingsSelector)

    getDomainState(): DomainState {
        return this.state.getValue().domainState
    }
}
