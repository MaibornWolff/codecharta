import { Component, ElementRef, output, viewChild } from "@angular/core"
import { ScenarioImportResult } from "../../../services/scenarioImportExport.service"

export interface ImportFeedback {
    duplicates: string[]
    invalid: string[]
    parseErrors: string[]
}

@Component({
    selector: "cc-import-feedback-dialog",
    templateUrl: "./importFeedbackDialog.component.html"
})
export class ImportFeedbackDialogComponent {
    readonly closed = output<void>()
    readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    feedback: ImportFeedback = { duplicates: [], invalid: [], parseErrors: [] }

    open(result: ScenarioImportResult) {
        const { duplicates, invalid, parseErrors } = result
        if (duplicates.length > 0 || invalid.length > 0 || parseErrors.length > 0) {
            this.feedback = { duplicates, invalid, parseErrors }
            this.dialogElement().nativeElement.showModal()
        }
    }

    close() {
        this.dialogElement().nativeElement.close()
        this.feedback = { duplicates: [], invalid: [], parseErrors: [] }
        this.closed.emit()
    }
}
