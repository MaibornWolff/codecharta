import { Action, Store } from "@ngrx/store"
import { BehaviorSubject } from "rxjs"
import { CcState } from "../codeCharta.model"

// Tracks whether a user-initiated heavy operation (e.g. blacklist add/remove)
// is currently waiting to be processed. The spinner reads this subject. Cleared
// by `renderCodeMap$` once the resulting render has finished.
export const isPendingHeavyDispatch$ = new BehaviorSubject<boolean>(false)

export function clearPendingHeavyDispatch(): void {
    if (isPendingHeavyDispatch$.value) {
        isPendingHeavyDispatch$.next(false)
    }
}

// Show the loading spinner immediately, yield two animation frames so the
// browser actually paints it, then dispatch the heavy action(s).
export function dispatchAfterPaint(store: Store<CcState>, action: Action | Action[]): void {
    const actions = Array.isArray(action) ? action : [action]

    // In jest tests rAF is async via setTimeout — skip the deferral so existing
    // dispatch-assertion tests stay synchronous. The spinner UX only matters at
    // runtime.
    if (typeof window !== "undefined" && (window as unknown as { __TEST_ENVIRONMENT__?: boolean }).__TEST_ENVIRONMENT__) {
        for (const a of actions) {
            store.dispatch(a)
        }
        return
    }

    isPendingHeavyDispatch$.next(true)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            for (const a of actions) {
                store.dispatch(a)
            }
        })
    })
}
