import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from "@angular/core"

/**
 * The house confirmation: a title, one sentence saying what happens, and No / Yes. Used by every
 * action that discards something, so they cannot drift apart in wording, shape or button order.
 */
@Component({
    selector: "cc-confirm-dialog",
    templateUrl: "./confirmDialog.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
    readonly title = input.required<string>()
    readonly message = input.required<string>()
    readonly testId = input<string | null>(null)

    readonly confirmed = output<void>()

    private readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    open() {
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    confirm() {
        this.close()
        this.confirmed.emit()
    }
}
