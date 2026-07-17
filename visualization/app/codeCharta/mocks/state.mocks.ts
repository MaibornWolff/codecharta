import { Provider } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../model/codeCharta.model"
import { defaultState } from "../stores/rootStore/state.manager"

/**
 * `provideMockStore` provides `MockState`, never ngrx's `State`. A read window injects `State` for its
 * synchronous accessors, so any TestBed that reaches one needs this alongside `provideMockStore`.
 */
export function provideMockState(state: CcState = defaultState): Provider {
    return { provide: State, useValue: { getValue: () => state } }
}
