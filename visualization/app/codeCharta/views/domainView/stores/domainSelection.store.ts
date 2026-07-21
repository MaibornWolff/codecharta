import { Injectable } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { BehaviorSubject } from "rxjs"

/**
 * The domain view's own, EPHEMERAL selection: the path of the node whose words the cloud shows. It lives
 * here and not in the global `sharedView` on purpose — domain selection is a word-cloud concept, not a map
 * one, and keeping it out of the persisted `CcState` means it never reaches IndexedDB (no migration, no
 * DB_VERSION bump) and never leaks into the metrics view. `null` means "nothing selected" — the cloud then
 * falls back to the root's aggregated words.
 *
 * A plain signal/observable service (like the explorer's collapse/width services) rather than an ngrx
 * slice: there is no persistence, no cross-cutting effect and no time-travel need for a single path.
 */
@Injectable({ providedIn: "root" })
export class DomainSelectionStore {
    private readonly selectedNodePathSubject = new BehaviorSubject<string | null>(null)

    /** For rxjs consumers (the word-cloud read store) that compose the selected node's words. */
    readonly selectedNodePath$ = this.selectedNodePathSubject.asObservable()

    /** For template consumers (the collapsed strip, the bottom bar) that read the current path directly. */
    readonly selectedNodePath = toSignal(this.selectedNodePath$, { requireSync: true })

    select(nodePath: string): void {
        this.selectedNodePathSubject.next(nodePath)
    }

    clear(): void {
        this.selectedNodePathSubject.next(null)
    }
}
