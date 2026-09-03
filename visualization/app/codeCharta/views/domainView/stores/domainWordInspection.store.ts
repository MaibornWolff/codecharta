import { Injectable, signal } from "@angular/core"

/** Which word's occurrences the explorer's word list has expanded — one at a time, project wide. */
@Injectable({ providedIn: "root" })
export class DomainWordInspectionStore {
    private readonly inspected = signal<string | null>(null)

    readonly inspectedWord = this.inspected.asReadonly()

    inspect(word: string): void {
        this.inspected.set(word)
    }

    toggle(word: string): void {
        this.inspected.update(inspectedWord => (inspectedWord === word ? null : word))
    }

    clear(): void {
        this.inspected.set(null)
    }
}
