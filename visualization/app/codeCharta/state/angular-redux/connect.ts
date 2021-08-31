/* eslint-disable unicorn/prevent-abbreviations */ // ts constructor needs `...args` as argument name

import { OnChanges, OnDestroy, SimpleChanges } from "@angular/core"
import { Action } from "redux"
import { BehaviorSubject } from "rxjs"

import { CcState, Store } from "../store/store"

type Constructor<T = unknown> = new (...args: unknown[]) => T
type This = InstanceType<Constructor>
type ActionCreator = (...args: unknown[]) => Action
type MapStateToThis<T extends Record<string, unknown>> = (state: CcState, that?: This) => T
type ConnectedProps<T extends Record<string, unknown>> = { [key in keyof T]: BehaviorSubject<T[key]> }

// todo
// @Matthias: should use Observerable / BehaviorSubject?
// tests
// error handling
// call .complete
// next only if != last value

// - We could make an own useful standalone npm module out of this class.
// - Instead of a mixin a class decorator would be nice, but it is not yet possible (https://github.com/Microsoft/TypeScript/issues/4881).

/**
 * Connects an Angular Component to a store similar to [react-redux's connect](https://react-redux.js.org/api/connect).
 *
 * @returns a class which is connected to redux store in visualization/app/codeCharta/state/store/store.ts.
 *    By `mapStateToThis` returned `MappedState` is added to properties of returned class and reflects store's state automatically.
 *    By `mapDispatchToThis` returned `MappedDispatch` is added to properties of returned class but actual dispatches to store.
 */
/* eslint-disable-next-line @typescript-eslint/ban-types */ // we actual want to infer nothing if `MappedDispatch` is not given
export const connect = <MappedState extends Record<string, unknown>, MappedDispatch extends Record<string, ActionCreator> = {}>(
	mapStateToThis?: MapStateToThis<MappedState>,
	mapDispatchToThis?: MappedDispatch
): Constructor<ConnectedProps<MappedState> & MappedDispatch & { ngOnDestroy: () => void }> => {
	let keysToTrack
	const updateState = (that: This, mappedState: MappedState) => {
		//	check last value equal
		for (const key of keysToTrack) {
			that[key].next(mappedState[key])
		}
	}
	let unsubscribe: () => void

	const setDispatchToThis = (that: This, keys: string[]) => {
		for (const key of keys) {
			that[key] = (...args: unknown[]) => {
				Store.store.dispatch(mapDispatchToThis[key](...args))
			}
		}
	}

	// Ignore TS2322 as we dynamically add all properties of ReturnType<typeof mapDispatchToThis>, which we don't know ahead
	// @ts-ignore - would be nice to only ignore TS2322, what is not possible yet (https://github.com/microsoft/TypeScript/issues/19139)
	return class implements OnChanges, OnDestroy {
		constructor() {
			if (mapStateToThis) {
				const initialMappedState = mapStateToThis(Store.store.getState(), this)
				keysToTrack = Object.keys(initialMappedState)
				for (const key of keysToTrack) this[key] = new BehaviorSubject(initialMappedState[key])

				unsubscribe = Store.store.subscribe(() => {
					updateState(this, mapStateToThis(Store.store.getState(), this))
				})

				// todo add unit test for this
				if (mapStateToThis.length === 2) {
					const hasChangeOtherThanKeysToTrack = (changes: SimpleChanges) => {
						for (const change in changes) {
							if (!keysToTrack.includes(change)) {
								return true
							}
						}
						return false
					}

					const actualNgOnChanges = this.ngOnChanges
					this.ngOnChanges = (changes: SimpleChanges) => {
						Reflect.apply(actualNgOnChanges, this, [changes])
						if (hasChangeOtherThanKeysToTrack(changes)) {
							updateState(this, mapStateToThis(Store.store.getState(), this))
						}
					}
				}
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

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		ngOnChanges(_: SimpleChanges) {
			// if not present in prototype Angular doesn't pick up this lifecycle hook
		}

		ngOnDestroy() {
			// to enforce cleanup, even if it gets overwritten, it is set in constructor
		}
	}
}
