import { Store } from "./store"
import { Store as PlainStore } from "../store/store"

import { sortingOrderAscendingSelector } from "../store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { toggleSortingOrderAscending } from "../store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"

describe("angular-redux store", () => {
	const storeService = new Store()

	beforeEach(() => {
		PlainStore["initialize"]()
	})

	it("should have initial value on selection", () => {
		const sortingOrderAscending$ = storeService.select(sortingOrderAscendingSelector)
		let initialValue
		sortingOrderAscending$.subscribe(v => {
			initialValue = v
		})
		expect(initialValue).toBe(false)
	})

	it("should update", () => {
		const sortingOrderAscending$ = storeService.select(sortingOrderAscendingSelector)
		let value
		sortingOrderAscending$.subscribe(v => {
			value = v
		})
		expect(value).toBe(false)

		PlainStore.store.dispatch(toggleSortingOrderAscending())

		expect(value).toBe(true)
	})

	it("should not call selector, when no one is subscribed", () => {
		const selector = jest.fn()
		storeService.select(selector)
		PlainStore.store.dispatch(toggleSortingOrderAscending())
		expect(selector).not.toHaveBeenCalled()
	})

	it("can unsubscribe from a subscription", () => {
		const selector = jest.fn()
		const selected$ = storeService.select(selector)
		const subscription = selected$.subscribe(jest.fn())
		expect(selector).toHaveBeenCalledTimes(1)

		subscription.unsubscribe()
		PlainStore.store.dispatch(toggleSortingOrderAscending())
		expect(selector).toHaveBeenCalledTimes(1)
	})
})
