import { DestroyRef, Injectable, inject, signal } from "@angular/core"

/**
 * Copies text to the clipboard and exposes a transient `copied` flag that stays true for FEEDBACK_MS, so a
 * button can show a brief "copied!" state. Provide at the component level so each host owns its own flag;
 * the pending reset timer is cleared on destroy.
 */
@Injectable()
export class CopyToClipboardService {
    private static readonly FEEDBACK_MS = 1500

    private resetTimeout?: ReturnType<typeof setTimeout>
    readonly copied = signal(false)

    constructor() {
        inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimeout))
    }

    async copy(text: string): Promise<void> {
        await navigator.clipboard.writeText(text)
        this.copied.set(true)
        clearTimeout(this.resetTimeout)
        this.resetTimeout = setTimeout(() => this.copied.set(false), CopyToClipboardService.FEEDBACK_MS)
    }
}
