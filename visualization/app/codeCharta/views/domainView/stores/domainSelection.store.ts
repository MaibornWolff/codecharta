import { Injectable } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { BehaviorSubject } from "rxjs"

// Deliberately outside the persisted `CcState`: the selection is ephemeral, so it never reaches
// IndexedDB and never leaks into the metrics view.
@Injectable({ providedIn: "root" })
export class DomainSelectionStore {
    private readonly selectedNodePathSubject = new BehaviorSubject<string | null>(null)

    readonly selectedNodePath$ = this.selectedNodePathSubject.asObservable()

    readonly selectedNodePath = toSignal(this.selectedNodePath$, { requireSync: true })

    select(nodePath: string): void {
        this.selectedNodePathSubject.next(nodePath)
    }

    clear(): void {
        this.selectedNodePathSubject.next(null)
    }
}
