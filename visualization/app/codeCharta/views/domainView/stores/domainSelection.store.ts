import { Injectable } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { BehaviorSubject } from "rxjs"

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
