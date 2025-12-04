import { Component, input, output } from "@angular/core"

@Component({
    selector: "cc-export-actions",
    templateUrl: "./exportActions.component.html"
})
export class ExportActionsComponent {
    isPrintMeshLoaded = input.required<boolean>()

    download3MF = output<void>()
    downloadSTL = output<void>()

    handleDownload3MF() {
        this.download3MF.emit()
    }

    handleDownloadSTL() {
        this.downloadSTL.emit()
    }
}
