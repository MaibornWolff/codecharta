import { Store, CcState } from "../../store/store"

/** workaround to enable selector based callbacks on store changes in AngularJS world */
export const onStoreChanged = <T>(selector: (state: CcState) => T, callback: (oldValue: T, newValue: T) => void) => {
	let lastValue: T
	return Store.store.subscribe(() => {
		const newValue = selector(Store.store.getState())
		if (lastValue !== newValue) {
			callback(lastValue, newValue)
			lastValue = newValue
		}
	})
}
