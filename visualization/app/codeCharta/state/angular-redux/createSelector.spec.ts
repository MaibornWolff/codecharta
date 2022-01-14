import { createSelector } from "./createSelector"

describe("createSelector", () => {
	it("should project correct value", () => {
		const state = { x: 2 }
		const selector = (s: typeof state) => s.x
		const doubledProjector = createSelector([selector], (n: number) => 2 * n)
		expect(doubledProjector(state)).toBe(4)
	})

	it("should not recalculate projector if its input hasn't changed", () => {
		const state = { x: 2 }
		const selector = (s: typeof state) => s.x
		const double = jest.fn((n: number) => 2 * n)
		const doubledProjector = createSelector([selector], double)
		expect(doubledProjector(state)).toBe(4)

		expect(doubledProjector(state)).toBe(4)
		expect(double).toHaveBeenCalledTimes(1)
	})
})
