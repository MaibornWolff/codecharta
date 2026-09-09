import { computed, Injectable, signal } from "@angular/core"

export interface UploadedShapeMask {
    fileName: string
    dataUri: string
}

/** The shape a reader uploaded, for as long as the tab is open. It is deliberately not persisted: the
 * cloud falls back to a circle after a reload, and the popover says so. */
@Injectable({ providedIn: "root" })
export class CustomShapeMaskStore {
    private readonly uploaded = signal<UploadedShapeMask | null>(null)

    readonly mask = this.uploaded.asReadonly()
    readonly dataUri = computed(() => this.uploaded()?.dataUri ?? null)

    accept(mask: UploadedShapeMask): void {
        this.uploaded.set(mask)
    }

    clear(): void {
        this.uploaded.set(null)
    }
}
