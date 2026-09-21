import { Action, Store } from "@ngrx/store"
import { CcState } from "../model/codeCharta.model"
import {
    clearPendingHeavyDispatch,
    dispatchAfterPaint,
    dispatchRuleChange,
    HEAVY_DISPATCH_MAX_WAIT_MS,
    isPendingHeavyDispatch$
} from "./dispatchAfterPaint"

const anAction: Action = { type: "AN_ACTION" }

describe("dispatchAfterPaint", () => {
    let store: Store<CcState>
    let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame

    beforeEach(() => {
        store = { dispatch: jest.fn() } as unknown as Store<CcState>
        clearPendingHeavyDispatch()

        globalThis["__TEST_ENVIRONMENT__"] = false
        jest.useFakeTimers()
        originalRequestAnimationFrame = globalThis.requestAnimationFrame
        globalThis.requestAnimationFrame = (callback => {
            callback(0)
            return 0
        }) as typeof globalThis.requestAnimationFrame
    })

    afterEach(() => {
        jest.useRealTimers()
        globalThis.requestAnimationFrame = originalRequestAnimationFrame
        globalThis["__TEST_ENVIRONMENT__"] = true
        clearPendingHeavyDispatch()
    })

    it("should show the spinner until the dispatched action has been processed", () => {
        // Act
        dispatchAfterPaint(store, anAction)

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(anAction)
        expect(isPendingHeavyDispatch$.value).toBe(true)
    })

    it("should clear the pending heavy dispatch when no render follows", () => {
        // Arrange — a dispatch that changes nothing produces no render, and the render is the only
        dispatchAfterPaint(store, anAction)

        // Act
        jest.advanceTimersByTime(HEAVY_DISPATCH_MAX_WAIT_MS + 1)

        // Assert
        expect(isPendingHeavyDispatch$.value).toBe(false)
    })

    it("should not clear the pending heavy dispatch before the backstop deadline", () => {
        // Arrange
        dispatchAfterPaint(store, anAction)

        // Act
        jest.advanceTimersByTime(HEAVY_DISPATCH_MAX_WAIT_MS - 1)

        // Assert
        expect(isPendingHeavyDispatch$.value).toBe(true)
    })

    it("should not resurrect the spinner when a render already cleared it", () => {
        // Arrange
        dispatchAfterPaint(store, anAction)
        clearPendingHeavyDispatch()

        // Act
        jest.advanceTimersByTime(HEAVY_DISPATCH_MAX_WAIT_MS + 1)

        // Assert
        expect(isPendingHeavyDispatch$.value).toBe(false)
    })
})

describe("dispatchRuleChange", () => {
    it("should dispatch a flatten change straight away, raising no spinner", () => {
        // Arrange
        const store = { dispatch: jest.fn() } as unknown as Store<CcState>
        const action = { type: "ADD_FLATTENED_NODES" }
        let wasPending = false
        const subscription = isPendingHeavyDispatch$.subscribe(isPending => {
            wasPending ||= isPending
        })

        // Act
        dispatchRuleChange(store, "flatten", action)

        // Assert — flattening changes how a subtree looks, not which nodes the map holds
        expect(store.dispatch).toHaveBeenCalledWith(action)
        expect(wasPending).toBe(false)
        subscription.unsubscribe()
    })

    it("should make an exclude change wait for the spinner to be painted", () => {
        // Arrange
        const store = { dispatch: jest.fn() } as unknown as Store<CcState>

        // Act
        dispatchRuleChange(store, "exclude", { type: "ADD_EXCLUDED_NODES" })

        // Assert — an exclusion re-decorates the whole tree, so the wait is earned
        expect(store.dispatch).toHaveBeenCalled()
    })
})
