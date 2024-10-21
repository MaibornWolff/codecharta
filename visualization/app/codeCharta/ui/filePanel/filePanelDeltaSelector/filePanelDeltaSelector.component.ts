import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CCFile, CcState, CodeMapNode } from "../../../codeCharta.model"
import { FileSelectionState } from "../../../model/files/files"
import { referenceFileSelector } from "../../../state/selectors/referenceFile/referenceFile.selector"
import { setDeltaComparison, setDeltaReference, switchReferenceAndComparison } from "../../../state/store/files/files.actions"
import { filesSelector } from "../../../state/store/files/files.selector"
import { pictogramBackgroundSelector } from "./pictogramBackground.selector"
import { MatDialog } from "@angular/material/dialog"
import { ALERT_ON_INCOMPATIBLE_MAPS, IncompatibleMapsDialogComponent } from "./incompatibleMapsDialog/incompatibleMapsDialog.component"

@Component({
    selector: "cc-file-panel-delta-selector",
    templateUrl: "./filePanelDeltaSelector.component.html",
    styleUrls: ["./filePanelDeltaSelector.component.scss"]
})
export class FilePanelDeltaSelectorComponent {
    files$ = this.store.select(filesSelector)
    referenceFile$ = this.store.select(referenceFileSelector)
    comparisonFile$ = this.files$.pipe(map(files => files.find(file => file.selectedAs === FileSelectionState.Comparison)?.file))
    possibleComparisonFiles$ = this.files$.pipe(map(files => files.filter(file => file.selectedAs !== FileSelectionState.Reference)))
    pictogramBackground$ = this.store.select(pictogramBackgroundSelector)
    referenceFile: CCFile
    comparisonFile: CCFile

    constructor(
        private store: Store<CcState>,
        private dialog: MatDialog
    ) {
        this.referenceFile$.subscribe(file => (this.referenceFile = file))
        this.comparisonFile$.subscribe(file => (this.comparisonFile = file))
    }

    handleDeltaReferenceFileChange(file: CCFile) {
        this.store.dispatch(setDeltaReference({ file }))
        this.showAlertWhenFilesAreIncompatible()
    }

    handleDeltaComparisonFileChange(file: CCFile) {
        this.store.dispatch(setDeltaComparison({ file }))
        this.showAlertWhenFilesAreIncompatible()
    }

    showAlertWhenFilesAreIncompatible() {
        if (this.alertOnIncompatibleMaps() && this.areMapsIncompatible()) {
            this.openIncompatibleMapsDialog()
        }
    }

    alertOnIncompatibleMaps() {
        return localStorage.getItem(ALERT_ON_INCOMPATIBLE_MAPS)
            ? JSON.parse(localStorage.getItem(ALERT_ON_INCOMPATIBLE_MAPS)) === true
            : true
    }

    openIncompatibleMapsDialog() {
        this.dialog.open(IncompatibleMapsDialogComponent, {
            panelClass: "cc-incompatible-maps-dialog",
            data: {
                referenceFileName: this.getFileName(this.referenceFile),
                comparisonFileName: this.getFileName(this.comparisonFile),
                fileWithMccMetric: this.getFileWithMccMetric(this.referenceFile, this.comparisonFile)
            }
        })
    }

    private getFileName(file: CCFile) {
        return file?.fileMeta.fileName
    }

    private hasMccMetric(file: CCFile) {
        return file?.map.children.some(node => this.containsMCCAttribute(node))
    }

    private containsMCCAttribute(node: CodeMapNode): boolean {
        if (node.attributes["mcc"]) {
            return true
        }

        if (node.children) {
            for (const child of node.children) {
                if (this.containsMCCAttribute(child)) {
                    return true
                }
            }
        }

        return false
    }

    private getFileWithMccMetric(referenceFile: CCFile, comparisonFile: CCFile) {
        if (this.hasMccMetric(referenceFile)) {
            return this.getFileName(referenceFile)
        }
        if (this.hasMccMetric(comparisonFile)) {
            return this.getFileName(comparisonFile)
        }
    }

    switchReferenceAndComparison() {
        this.store.dispatch(switchReferenceAndComparison())
    }

    areMapsIncompatible() {
        if (this.referenceFile && this.comparisonFile) {
            return this.hasMccMetric(this.referenceFile) !== this.hasMccMetric(this.comparisonFile)
        }
    }
}
