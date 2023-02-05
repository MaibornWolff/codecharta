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

	it("should have type safe parameters", async () => {
		const debouncedSquare = debounce((n: number) => n * n, 0)
		// @ts-expect-error
		debouncedSquare("2")
		debouncedSquare(2)
		await wait(0)
	})
})
