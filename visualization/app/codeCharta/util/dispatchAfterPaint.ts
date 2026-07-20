import { Action, Store } from "@ngrx/store"
import { BehaviorSubject } from "rxjs"
import { CcState } from "../model/codeCharta.model"

// Tracks whether a user-initiated heavy operation (e.g. blacklist add/remove)
// is currently waiting to be processed. The spinner reads this subject. Cleared
// by `renderCodeMap$` once the resulting render has finished.
export const isPendingHeavyDispatch$ = new BehaviorSubject<boolean>(false)

/**
 * The backstop for a dispatch that never renders. `renderCodeMap$` is the normal clear, but it only
 * runs when the dispatched action actually changes the accumulated data — a no-op exclude leaves
 * nothing to render, and without this the spinner would stay up for the rest of the session.
 *
 * A genuinely slow render blocks the main thread, so this timer cannot fire mid-render and cut a real
 * one short: it lands after the render has already cleared the flag, where it is a no-op.
 */
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

// Show the loading spinner immediately, yield two animation frames so the
// browser actually paints it, then dispatch the heavy action(s).
export function dispatchAfterPaint(store: Store<CcState>, action: Action | Action[]): void {
    const actions = Array.isArray(action) ? action : [action]

    // In jest tests rAF is async via setTimeout — skip the deferral so existing
    // dispatch-assertion tests stay synchronous. The spinner UX only matters at
    // runtime.
    if ((globalThis as unknown as { __TEST_ENVIRONMENT__?: boolean }).__TEST_ENVIRONMENT__) {
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
            pendingBackstop = setTimeout(clearPendingHeavyDispatch, HEAVY_DISPATCH_MAX_WAIT_MS)
        })
    })
}
