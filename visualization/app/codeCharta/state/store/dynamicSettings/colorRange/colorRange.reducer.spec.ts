import { colorRange } from "./colorRange.reducer"
import { defaultColorRange, setColorRange } from "./colorRange.actions"

describe("colorRange", () => {
	it("should set new colorRange", () => {
		const result = colorRange({ from: 0, to: 0, min: 0, max: 0 }, setColorRange({ from: 21, to: 42, min: 0, max: 100 }))

		expect(result).toEqual({ from: 21, to: 42, min: 0, max: 100 })
	})

	it("should set default colorRange", () => {
		const result = colorRange({ from: 33, to: 66, min: 0, max: 10 }, setColorRange())

		expect(result).toEqual(defaultColorRange)
	})
})
