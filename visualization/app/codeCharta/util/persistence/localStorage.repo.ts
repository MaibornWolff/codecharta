import { Injectable } from "@angular/core"

/** A browser that blocks storage, or a full one, throws on access. What is kept here is a convenience, so a value
 * that cannot be read counts as never written and one that cannot be written is let go. */
@Injectable({ providedIn: "root" })
export class LocalStorageRepo {
    read(key: string): string | null {
        try {
            return localStorage.getItem(key)
        } catch {
            return null
        }
    }

    write(key: string, value: string): void {
        try {
            localStorage.setItem(key, value)
        } catch {
            // Nothing to fall back to: the value lives on in memory for this visit.
        }
    }
}
