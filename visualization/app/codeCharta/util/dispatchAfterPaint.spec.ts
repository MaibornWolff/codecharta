import { Action, Store } from "@ngrx/store"
import { CcState } from "../model/codeCharta.model"
import { clearPendingHeavyDispatch, dispatchAfterPaint, HEAVY_DISPATCH_MAX_WAIT_MS, isPendingHeavyDispatch$ } from "./dispatchAfterPaint"

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
