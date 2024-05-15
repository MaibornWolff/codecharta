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
})
