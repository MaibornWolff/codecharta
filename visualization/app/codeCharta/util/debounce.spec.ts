import { debounce } from "./debounce"
import { wait } from "./testUtils/wait"

describe("debounce", () => {
    it("should debounce given function", async () => {
        const f = jest.fn()
        const debouncedF = debounce(f, 1)

        debouncedF()
        debouncedF()
        expect(f).not.toHaveBeenCalled()

        await wait(1)
        expect(f).toHaveBeenCalledTimes(1)
    })

    it("should invoke the pending call immediately when flushed", async () => {
        // Arrange
        const f = jest.fn()
        const debouncedF = debounce(f, 1000)
        debouncedF("latest")

        // Act
        debouncedF.flush()

        // Assert
        expect(f).toHaveBeenCalledTimes(1)
        expect(f).toHaveBeenCalledWith("latest")

        await wait(1)
        expect(f).toHaveBeenCalledTimes(1)
    })

    it("should do nothing when flushed without a pending call", () => {
        // Arrange
        const f = jest.fn()
        const debouncedF = debounce(f, 1)

        // Act
        debouncedF.flush()

        // Assert
        expect(f).not.toHaveBeenCalled()
    })

    it("should drop the pending call when cancelled", async () => {
        // Arrange
        const f = jest.fn()
        const debouncedF = debounce(f, 1)
        debouncedF()

        // Act
        debouncedF.cancel()

        // Assert
        await wait(1)
        expect(f).not.toHaveBeenCalled()
    })
})
