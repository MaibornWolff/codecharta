import { CcState } from "../store/store"

type Selector<T> = (state: CcState) => T

export function createSelector<S1, P>(selectors: [Selector<S1>], projector: (s1: S1) => P): (state: CcState) => P
export function createSelector<S1, S2, P>(selectors: [Selector<S1>, Selector<S2>?], projector: (s1: S1, s2: S2) => P)
export function createSelector<S1, S2, S3, S4, P>(
	selectors: [Selector<S1>, Selector<S2>?, Selector<S3>?, Selector<S4>?],
	projector: (s1: S1, s2?: S2, s3?: S3, s4?: S4) => P
): (state: CcState) => P

export function createSelector<S1, S2, S3, S4, P>(
	selectors: [Selector<S1>, Selector<S2>?, Selector<S3>?, Selector<S4>?],
	projector: (s1: S1, s2?: S2, s3?: S3, s4?: S4) => P
) {
	let lastValues = []
	let memorizedResult: P

	return (state: CcState) => {
		const values = selectors.map(s => s(state))
		if (values.some((value, index) => value !== lastValues[index])) {
			lastValues = values
			memorizedResult = projector.call(null, ...values)
		}
		return memorizedResult
	}
}
