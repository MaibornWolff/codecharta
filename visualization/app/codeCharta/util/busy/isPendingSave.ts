import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs"

/**
 * Whether a session save is still waiting to run or running. Writing the session copies it on the main
 * thread, so the map is not usable while it happens — the spinner stays up rather than inviting the
 * reader to drag a map that cannot answer yet.
 */
const pendingSaves = new BehaviorSubject(0)

export const isPendingSave$: Observable<boolean> = pendingSaves.pipe(
    map(count => count > 0),
    distinctUntilChanged()
)

export function beginPendingSave(): void {
    pendingSaves.next(pendingSaves.value + 1)
}

export function endPendingSave(): void {
    pendingSaves.next(Math.max(0, pendingSaves.value - 1))
}
