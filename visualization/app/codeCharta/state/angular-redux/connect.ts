/* eslint-disable unicorn/prevent-abbreviations */ // ts constructor needs `...args` as argument name

import { OnDestroy } from "@angular/core"
import { Action } from "redux"

import { CcState, Store } from "../store/store"

type Constructor<T = unknown> = new (...args: unknown[]) => T
type This = InstanceType<Constructor>
type ActionCreator = (...args: unknown[]) => Action

// - We could make an own useful standalone npm module out of this class.
// - Instead of a mixin a class decorator would be nice, but it is not yet possible (https://github.com/Microsoft/TypeScript/issues/4881).

/**
 * Connect an Angular Component to a store similar to [react-redux's connect](https://react-redux.js.org/api/connect).
 *
 * @returns a class which is connected to redux store in visualization/app/codeCharta/state/store/store.ts.
 *    By `mapStateToThis` returned `MappedState` is added to properties of returned class and reflects store's state automatically.
 *    By `mapDispatchToThis` returned `MappedDispatch` is added to properties of returned class but actual dispatches to store.
 */
export const connect = <MappedState extends Record<string, unknown>, MappedDispatch extends Record<string, ActionCreator>>(
	mapStateToThis?: (state: CcState) => MappedState,
	mapDispatchToThis?: MappedDispatch
): Constructor<ReturnType<typeof mapStateToThis> & MappedDispatch> => {
	const setStateToThis = (that: This, keys: string[], mappedState: ReturnType<typeof mapStateToThis>) => {
		// always assigning no matter if changed should be fine as Angular has its own update mechanism anyway
		for (const key of keys) that[key] = mappedState[key]
	}
	let unsubscribe: () => void

	const setDispatchToThis = (that: This, keys: string[]) => {
		for (const key of keys) {
			that[key] = (...args: unknown[]) => Store.store.dispatch(mapDispatchToThis[key](...args))
		}
	}

	// Ignore TS2322 as we dynamically add all properties of ReturnType<typeof mapDispatchToThis>, which we don't know ahead
	// @ts-ignore - would be nice to only ignore TS2322, what is not possible yet (https://github.com/microsoft/TypeScript/issues/19139)
	return class implements OnDestroy {
		constructor() {
			if (mapStateToThis) {
				const initialMappedState = mapStateToThis(Store.store.getState())
				const keysToTrack = Object.keys(initialMappedState)
				setStateToThis(this, keysToTrack, initialMappedState)
				unsubscribe = Store.store.subscribe(() => {
					setStateToThis(this, keysToTrack, mapStateToThis(Store.store.getState()))
				})
			}

			if (mapDispatchToThis) {
				setDispatchToThis(this, Object.keys(mapDispatchToThis))
			}

			// cleanup
			if (unsubscribe) {
				const actualOnDestroy = this.ngOnDestroy
				this.ngOnDestroy = () => {
					unsubscribe()
					actualOnDestroy.apply(this)
				}
			}
		}

		ngOnDestroy() {
			// to enforce cleanup, even if it gets overwritten, it is set in constructor
		}
	}
}
