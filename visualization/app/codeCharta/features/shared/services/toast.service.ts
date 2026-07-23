import { Injectable, signal } from "@angular/core"

export type ToastSeverity = "info" | "success" | "warning" | "error"

export interface ToastMessage {
    readonly id: number
    readonly text: string
    readonly severity: ToastSeverity
}

/**
 * A minimal, app-wide toast/notification channel. Any layer can push a short, self-dismissing message the
 * user would otherwise never see — its first caller is the domain→map redirect, which used to swap the view
 * out from under the user with no explanation (finding LOW-5).
 *
 * It holds the active messages in a signal so the single `<cc-toast>` host (mounted in the app shell) can
 * render them with zoneless-friendly change detection. Each message auto-dismisses after a few seconds and
 * can also be dismissed by hand; ids are monotonic so a manual dismiss and its pending timer never collide.
 */
@Injectable({ providedIn: "root" })
export class ToastService {
    private static readonly AUTO_DISMISS_MS = 5000

    private nextId = 0
    private readonly activeMessages = signal<ToastMessage[]>([])

    readonly messages = this.activeMessages.asReadonly()

    show(text: string, severity: ToastSeverity = "info"): number {
        const id = this.nextId++
        this.activeMessages.update(messages => [...messages, { id, text, severity }])
        setTimeout(() => this.dismiss(id), ToastService.AUTO_DISMISS_MS)
        return id
    }

    dismiss(id: number): void {
        this.activeMessages.update(messages => messages.filter(message => message.id !== id))
    }
}
