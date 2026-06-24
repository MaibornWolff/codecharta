import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, viewChild } from "@angular/core"
import { ErrorDialogService } from "./errorDialog.service"

export interface ErrorDialogData {
    title: string
    message: string
    resolveErrorData?: { buttonText: string; onResolveErrorClick: () => void }
}

@Component({
    selector: "cc-error-dialog",
    templateUrl: "./errorDialog.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorDialogComponent implements OnInit {
    private readonly errorDialogService = inject(ErrorDialogService)

    readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    readonly data = signal<ErrorDialogData | null>(null)

    ngOnInit(): void {
        this.errorDialogService.register(this)
    }

    open(data: ErrorDialogData) {
        this.data.set(data)
        this.dialog().nativeElement.showModal()
    }

    close() {
        this.dialog().nativeElement.close()
    }

    handleResolveClick() {
        this.data()?.resolveErrorData?.onResolveErrorClick()
        this.close()
    }
}
