import { Injectable, inject, signal } from "@angular/core"
import { skip } from "rxjs"
import { DomainSelectionStore } from "./domainSelection.store"

@Injectable({ providedIn: "root" })
export class DomainWordInspectionStore {
    private readonly inspected = signal<string | null>(null)

    readonly inspectedWord = this.inspected.asReadonly()

    constructor() {
        // The breakdown reports on the selected node's subtree, so a new selection outdates it.
        inject(DomainSelectionStore)
            .selectedNodePath$.pipe(skip(1))
            .subscribe(() => this.clear())
    }

    inspect(word: string): void {
        this.inspected.set(word)
    }

    clear(): void {
        this.inspected.set(null)
    }
}
