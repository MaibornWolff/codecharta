import { Injectable } from "@angular/core"

@Injectable({ providedIn: "root" })
export class LocalStorageRepo {
    read(key: string): string | null {
        return localStorage.getItem(key)
    }

    write(key: string, value: string): void {
        localStorage.setItem(key, value)
    }
}
