import { Injectable, signal } from "@angular/core"

export type ToastSeverity = "info" | "success" | "warning" | "error"

export interface ToastMessage {
    readonly id: number
    readonly text: string
    readonly severity: ToastSeverity
}

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
