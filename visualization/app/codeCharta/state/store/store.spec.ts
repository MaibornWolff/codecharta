import { Subject } from "rxjs"
import { EffectsModule } from "../angular-redux/effects/effects.module"
import { Store } from "./store"

describe("plain redux store", () => {
	beforeEach(() => {
		EffectsModule.actions$ = new Subject()
	})

	afterEach(() => {
		EffectsModule.actions$.complete()
	})

	it("should push a new event into actions$ for making EffectsModule work", () => {
		const subscription = jest.fn()
		EffectsModule.actions$.subscribe(subscription)

		Store.dispatch({ type: "something" })

		expect(subscription).toHaveBeenCalledWith({ type: "something" })
	})
})
