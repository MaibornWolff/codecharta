import { Component, ElementRef, input, output, viewChild } from "@angular/core"

@Component({
    selector: "cc-delete-confirm-dialog",
    templateUrl: "./deleteConfirmDialog.component.html"
})
export class DeleteConfirmDialogComponent {
    readonly scenarioName = input.required<string>()
    readonly confirmed = output<void>()
    readonly cancelled = output<void>()

    readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

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

    cancel() {
        this.close()
        this.cancelled.emit()
    }
}
