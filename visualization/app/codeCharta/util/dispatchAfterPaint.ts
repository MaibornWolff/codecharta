import { Action, Store } from "@ngrx/store"
import { BehaviorSubject } from "rxjs"
import { CcState } from "../model/codeCharta.model"

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

function isRunningInTests(): boolean {
    return (globalThis as unknown as { __TEST_ENVIRONMENT__?: boolean }).__TEST_ENVIRONMENT__ === true
}

function dispatchAll(store: Store<CcState>, actions: Action[]): void {
    for (const action of actions) {
        store.dispatch(action)
    }
}
