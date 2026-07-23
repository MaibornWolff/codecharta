import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { ToastService } from "../../services/toast.service"

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
