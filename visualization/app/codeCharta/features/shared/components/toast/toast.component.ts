import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { ToastService } from "../../services/toast.service"

/**
 * The single app-wide toast host, mounted once in the app shell. It renders the messages held by
 * ToastService as a stack of daisyUI alerts and delegates every dismissal back to the service, so the
 * component stays purely presentational. The container is an `aria-live="polite"` status region, so a
 * screen reader announces each message the moment it appears — the whole point of the channel is feedback
 * the user would otherwise miss.
 */
@Component({
    selector: "cc-toast",
    templateUrl: "./toast.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
    private readonly toastService = inject(ToastService)

    protected readonly messages = this.toastService.messages

    protected dismiss(id: number): void {
        this.toastService.dismiss(id)
    }
}
