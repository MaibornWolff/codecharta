import { Injectable, signal } from "@angular/core"

@Injectable({ providedIn: "root" })
export class WordCloudViewStore {
    private readonly fitRequestCount = signal(0)

    readonly fitRequest = this.fitRequestCount.asReadonly()

    requestFit(): void {
        this.fitRequestCount.update(count => count + 1)
    }
}
