import ngRedux from "ng-redux"

import { CcState } from "./store"

type Selector<T> = (state: CcState) => T

export const onStoreValueChanged = <T>($ngRedux: ngRedux.INgRedux, selector: Selector<T>, callback: (oldValue: T, newValue: T) => void) => {
	let oldValue = selector($ngRedux.getState<CcState>())
	return $ngRedux.subscribe(() => {
		const newValue = selector($ngRedux.getState<CcState>())
		if (oldValue !== newValue) {
			callback(oldValue, newValue)
			oldValue = newValue
		}
	})
}
