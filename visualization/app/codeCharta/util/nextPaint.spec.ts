import { nextPaint } from "./nextPaint"

describe("nextPaint", () => {
    const realRequestAnimationFrame = globalThis.requestAnimationFrame
    let frameCallbacks: FrameRequestCallback[]

    beforeEach(() => {
        // The schedulers short-circuit under the tests' own clock, so this asks for the browser path.
        ;(globalThis as unknown as { __TEST_ENVIRONMENT__: boolean }).__TEST_ENVIRONMENT__ = false
        frameCallbacks = []
        globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => frameCallbacks.push(callback)
        // Only the timer is faked: faking animation frames too would replace the stub above with jest's
        // own, and the frames this drives by hand would never reach it.
        jest.useFakeTimers({ doNotFake: ["requestAnimationFrame"] })
    })

    afterEach(() => {
        jest.useRealTimers()
        globalThis.requestAnimationFrame = realRequestAnimationFrame
        ;(globalThis as unknown as { __TEST_ENVIRONMENT__: boolean }).__TEST_ENVIRONMENT__ = true
    })

    async function hasResolved(painted: Promise<void>): Promise<boolean> {
        let resolved = false
        void painted.then(() => {
            resolved = true
        })
        await Promise.resolve()
        await Promise.resolve()
        return resolved
    }

    function runNextFrame(): void {
        const callbacks = frameCallbacks
        frameCallbacks = []
        for (const callback of callbacks) {
            callback(0)
        }
    }

    it("should resolve once the browser has had a frame to paint in", async () => {
        // Arrange
        const painted = nextPaint()

        // Act
        runNextFrame()
        runNextFrame()

        // Assert
        expect(await hasResolved(painted)).toBe(true)
    })

    it("should resolve without a frame when the tab is hidden, so the load it gates cannot stall", async () => {
        // Arrange - a hidden tab runs no animation frame at all, so no callback ever comes
        const painted = nextPaint()
        expect(await hasResolved(painted)).toBe(false)

        // Act
        jest.advanceTimersByTime(250)

        // Assert
        expect(await hasResolved(painted)).toBe(true)
    })
})
