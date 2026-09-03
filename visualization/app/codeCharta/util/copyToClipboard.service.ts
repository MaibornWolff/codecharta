import { DestroyRef, Injectable, inject, signal } from "@angular/core"

@Injectable()
export class CopyToClipboardService {
    private static readonly FEEDBACK_MS = 1500

    private resetTimeout?: ReturnType<typeof setTimeout>
    readonly copied = signal(false)

    constructor() {
        inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimeout))
    }

    reset(): void {
        clearTimeout(this.resetTimeout)
        this.copied.set(false)
    }

    async copy(text: string): Promise<void> {
        await navigator.clipboard.writeText(text)
        this.copied.set(true)
        clearTimeout(this.resetTimeout)
        this.resetTimeout = setTimeout(() => this.copied.set(false), CopyToClipboardService.FEEDBACK_MS)
    }
}
