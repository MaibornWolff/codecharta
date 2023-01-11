import { Subject } from "rxjs"
import { Store } from "../../store/store"
import { createEffect } from "./createEffect"

jest.mock("../../store/store", () => ({
	Store: {}
}))
const MockedStore = jest.mocked(Store)

describe("createEffect", () => {
	let source

	beforeEach(() => {
		source = new Subject()
		MockedStore.dispatch = jest.fn()
	})

	afterEach(() => {
		source.complete()
	})

	it("should observe and dispatch each received value", () => {
		createEffect(() => source)
		source.next({ type: "some-action-type" })
		source.next({ type: "some-other-action-type" })
		expect(MockedStore.dispatch).toHaveBeenCalledTimes(2)
		expect(MockedStore.dispatch.mock.calls[0][0]).toEqual({ type: "some-action-type" })
		expect(MockedStore.dispatch.mock.calls[1][0]).toEqual({ type: "some-other-action-type" })
	})

	it("should not dispatch if dispatch is set to false", () => {
		createEffect(() => source, { dispatch: false })
		source.next({ type: "some-action-type" })
		expect(MockedStore.dispatch).not.toHaveBeenCalled()
	})

	it("should return an observable which outputs whenever given source outputs", () => {
		const effect$ = createEffect(() => source)
		const onEffect = jest.fn()
		effect$.subscribe(onEffect)

		source.next({ type: "some-action-type" })
		expect(onEffect).toBeCalledWith({ type: "some-action-type" })
	})
})
