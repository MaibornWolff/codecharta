import { CcState, Store } from "../store/store"
import { createSelector } from "./createSelector"

describe("createSelector", () => {
	it("should project correct value", () => {
		const selector = (state: CcState) => state.appSettings.edgeHeight
		const doubledProjector = createSelector(selector, (n: number) => 2 * n)
		expect(doubledProjector(Store.store.getState())).toBe(2 * Store.store.getState().appSettings.edgeHeight)
	})

	it("should not recalculate projector if its input hasn't changed", () => {
		const selector = (state: CcState) => state.appSettings.edgeHeight
		const projector = jest.fn((n: number) => 2 * n)
		const doubledProjector = createSelector(selector, projector)
		expect(doubledProjector(Store.store.getState())).toBe(2 * Store.store.getState().appSettings.edgeHeight)

		expect(doubledProjector(Store.store.getState())).toBe(2 * Store.store.getState().appSettings.edgeHeight)
		expect(projector).toHaveBeenCalledTimes(1)
	})
})
