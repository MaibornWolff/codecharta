import { setSortingOrderAscending } from "../store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { sortingOrderAscendingSelector } from "../store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { CcState, Store } from "../store/store"
import { connect } from "./connect"

describe("connect", () => {
	beforeEach(() => {
		Store["initialize"]()
		jest.spyOn(Store["_store"], "dispatch")
	})

	it("should map state to this", () => {
		const Connected = connect((state: CcState) => ({ orderAscending: sortingOrderAscendingSelector(state) }))
		const connected = new (class extends Connected {})()
		expect(connected.orderAscending).toBe(false)
	})

	it("should update its mapped state", () => {
		const Connected = connect((state: CcState) => ({ orderAscending: sortingOrderAscendingSelector(state) }))
		const connected = new (class extends Connected {})()
		Store.store.dispatch(setSortingOrderAscending(true))
		expect(connected.orderAscending).toBe(true)
	})

	it("should map dispatch to this", () => {
		const Connected = connect(undefined, { setSortingOrderAscending })
		const connected = new (class extends Connected {})()
		expect(typeof connected.setSortingOrderAscending).toBe("function")
		connected.setSortingOrderAscending(true)
		expect(Store.store.dispatch).toHaveBeenCalledTimes(1)
	})

	it("should unsubscribe to store on destroy", () => {
		const mockedUnsubscribe = jest.fn()
		Store.store.subscribe = jest.fn(() => mockedUnsubscribe)
		const Connected = connect(() => ({}))
		const connected = new (class extends Connected {})()

		connected.ngOnDestroy()

		expect(mockedUnsubscribe).toHaveBeenCalled()
	})
})
