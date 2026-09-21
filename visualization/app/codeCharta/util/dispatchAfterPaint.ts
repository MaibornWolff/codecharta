import { Action, Store } from "@ngrx/store"
import { BehaviorSubject } from "rxjs"
import { CcState, RuleEffect } from "../model/codeCharta.model"
import { isRunningInTests } from "./isRunningInTests"

export const isPendingHeavyDispatch$ = new BehaviorSubject<boolean>(false)

export const HEAVY_DISPATCH_MAX_WAIT_MS = 2_000

let pendingBackstop: ReturnType<typeof setTimeout> | undefined

export function clearPendingHeavyDispatch(): void {
    if (pendingBackstop !== undefined) {
        clearTimeout(pendingBackstop)
        pendingBackstop = undefined
    }
    if (isPendingHeavyDispatch$.value) {
        isPendingHeavyDispatch$.next(false)
    }
}

export function dispatchAfterPaint(store: Store<CcState>, action: Action | Action[]): void {
    const actions = Array.isArray(action) ? action : [action]

    if (isRunningInTests()) {
        dispatchAll(store, actions)
        return
    }

    isPendingHeavyDispatch$.next(true)
    afterSpinnerHasBeenPainted(() => {
        dispatchAll(store, actions)
        pendingBackstop = setTimeout(clearPendingHeavyDispatch, HEAVY_DISPATCH_MAX_WAIT_MS)
    })
}

function afterSpinnerHasBeenPainted(dispatch: () => void): void {
    requestAnimationFrame(() => requestAnimationFrame(dispatch))
}

function dispatchAll(store: Store<CcState>, actions: Action[]): void {
    for (const action of actions) {
        store.dispatch(action)
    }
}

/**
 * Flattening changes how a subtree looks, never which nodes the map holds, so it costs a redraw and
 * nothing more — the spinner an exclusion's rebuild earns would only read as a cost that is not
 * there. Exclusion re-decorates the whole tree, so it keeps the wait.
 */
export function dispatchRuleChange(store: Store<CcState>, effect: RuleEffect, action: Action | Action[]): void {
    if (effect === "exclude") {
        dispatchAfterPaint(store, action)
        return
    }
    dispatchAll(store, Array.isArray(action) ? action : [action])
}
