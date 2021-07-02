/* eslint-disable unicorn/prevent-abbreviations */ // ts constructor needs `...args` as argument name

import { OnDestroy } from "@angular/core"
import { Action } from "redux"

import { CcState, Store } from "../store/store"

type Constructor<T = unknown> = new (...args: unknown[]) => T
type This = InstanceType<Constructor>
type ActionCreator = (...args: unknown[]) => Action

/**
 * - Todo tests
 * - Todo docs
 * - Todo own npm module
 * - Todo class decorator not yet possible (https://github.com/Microsoft/TypeScript/issues/4881)
 **/
export const connect = <MappedState extends Record<string, unknown>, MappedDispatch extends Record<string, ActionCreator>>(
	mapStateToThis: (state: CcState) => MappedState,
	mapDispatchToThis?: () => MappedDispatch
): Constructor<ReturnType<typeof mapStateToThis> & ReturnType<typeof mapDispatchToThis>> => {
	const initialMappedState = mapStateToThis(Store.store.getState())
	const keysToTrack = Object.keys(initialMappedState)
	const setStateToThis = (that: This, mappedState: ReturnType<typeof mapStateToThis>) => {
		// always assigning no matter if changed should be fine as Angular has its own update mechanism anyway
		for (const key of keysToTrack) that[key] = mappedState[key]
	}
	let unsubscribe: () => void

	const setDispatchToThis = (that: This) => {
		if (!mapDispatchToThis) return

		const dispatchesToMap = mapDispatchToThis()
		for (const key of Object.keys(dispatchesToMap)) {
			that[key] = (...args: unknown[]) => Store.store.dispatch(dispatchesToMap[key](...args))
		}
	}

	// Ignore TS2322 as we dynamically add all properties of ReturnType<typeof mapDispatchToThis>, which we don't know ahead
	// @ts-ignore - would be nice to only ignore TS2322, what is not possible yet (https://github.com/microsoft/TypeScript/issues/19139)
	return class implements OnDestroy {
		constructor() {
			setStateToThis(this, mapStateToThis(Store.store.getState()))
			unsubscribe = Store.store.subscribe(() => {
				setStateToThis(this, mapStateToThis(Store.store.getState()))
			})
			setDispatchToThis(this)

			// cleanup
			const actualOnDestroy = this.ngOnDestroy
			this.ngOnDestroy = () => {
				unsubscribe()
				actualOnDestroy.apply(this)
			}
		}

		ngOnDestroy() {
			// to enforce cleanup even if it gets overwritten it is implemented in constructor
		}
	}
}
