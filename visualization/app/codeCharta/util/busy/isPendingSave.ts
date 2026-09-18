import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs"

/** Whether a save is waiting or running. It copies the session on the main thread, so the map is not
 * usable while it happens. */
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
