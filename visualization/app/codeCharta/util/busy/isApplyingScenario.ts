import { BehaviorSubject } from "rxjs"

/**
 * Applying a scenario is not a file load, but it does busy the map — so it shows the same spinner
 * while it dispatches its patches. It gets its own flag rather than borrowing isLoadingFile, which
 * belongs to the load pipeline and is written only there.
 */
const isApplyingScenarioSubject = new BehaviorSubject(false)

export const isApplyingScenario$ = isApplyingScenarioSubject.asObservable()

export function setIsApplyingScenario(value: boolean) {
    isApplyingScenarioSubject.next(value)
}
