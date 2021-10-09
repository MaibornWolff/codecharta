import { CcState } from "../store/store"

type Selector<T, State = CcState> = (state: State) => T

export function createSelector<S1, P, State = CcState>(selectors: [Selector<S1, State>], projector: (s1: S1) => P): (state: State) => P
export function createSelector<S1, S2, P, State = CcState>(
	selectors: [Selector<S1, State>, Selector<S2, State>?],
	projector: (s1: S1, s2: S2) => P
): (state: State) => P
export function createSelector<S1, S2, S3, S4, P, State = CcState>(
	selectors: [Selector<S1, State>, Selector<S2, State>?, Selector<S3, State>?, Selector<S4, State>?],
	projector: (s1: S1, s2?: S2, s3?: S3, s4?: S4) => P
): (state: State) => P

export function createSelector<S1, S2, S3, S4, P, State = CcState>(
	selectors: [Selector<S1, State>, Selector<S2, State>?, Selector<S3, State>?, Selector<S4, State>?],
	projector: (s1: S1, s2?: S2, s3?: S3, s4?: S4) => P
): (state: State) => P {
	let lastValues = []
	let memorizedResult: P

	return (state: State) => {
		const values = selectors.map(s => s(state))
		if (values.some((value, index) => value !== lastValues[index])) {
			lastValues = values
			memorizedResult = projector.call(null, ...values)
		}
		return memorizedResult
	}
}
