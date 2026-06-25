import { Injectable } from "@angular/core"
import { ErrorDialogData } from "./errorDialog.model"

interface ErrorDialogHost {
    open(data: ErrorDialogData): void
}

@Injectable({ providedIn: "root" })
export class ErrorDialogService {
    private dialog: ErrorDialogHost | null = null

    register(dialog: ErrorDialogHost): void {
        this.dialog = dialog
    }

    open(data: ErrorDialogData): void {
        this.dialog?.open(data)
    }
}
