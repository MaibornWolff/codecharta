import { BehaviorSubject, Observable } from "rxjs"

/** What the loader is busy with, shown under the spinner. Null whenever nothing is loading. */
const loadPhaseSubject = new BehaviorSubject<string | null>(null)

export const loadPhase$: Observable<string | null> = loadPhaseSubject.asObservable()

export function setLoadPhase(phase: string): void {
    loadPhaseSubject.next(phase)
}

export function clearLoadPhase(): void {
    loadPhaseSubject.next(null)
}

export function describeFileBeingRead(fileName: string, index: number, total: number): string {
    return total === 1 ? `Reading ${fileName}` : `Reading ${fileName} (${index} of ${total})`
}
