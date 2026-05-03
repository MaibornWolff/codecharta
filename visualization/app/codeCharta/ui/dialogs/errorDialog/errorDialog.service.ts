import { Injectable } from "@angular/core"
import { ErrorDialogComponent, ErrorDialogData } from "./errorDialog.component"

@Injectable({ providedIn: "root" })
export class ErrorDialogService {
    private dialog: ErrorDialogComponent | null = null

    register(dialog: ErrorDialogComponent): void {
        this.dialog = dialog
    }

    open(data: ErrorDialogData): void {
        this.dialog?.open(data)
    }
}
