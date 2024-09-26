import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { map, Observable } from "rxjs"
import { CCFile, CcState } from "../../../codeCharta.model"
import { FileSelectionState } from "../../../model/files/files"
import { referenceFileSelector } from "../../../state/selectors/referenceFile/referenceFile.selector"
import { setDeltaComparison, setDeltaReference, switchReferenceAndComparison } from "../../../state/store/files/files.actions"
import { filesSelector } from "../../../state/store/files/files.selector"
import { pictogramBackgroundSelector } from "./pictogramBackground.selector"
import { MatDialog } from "@angular/material/dialog"
import { IncompatibleMapsDialogComponent } from "./incompatibleMapsDialog/incompatibleMapsDialog.component"

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

    constructor(
        private store: Store<CcState>,
        private dialog: MatDialog
    ) {}

    handleDeltaReferenceFileChange(file: CCFile) {
        this.store.dispatch(setDeltaReference({ file }))
    }

    handleDeltaComparisonFileChange(file: CCFile) {
        if (this.areMapsIncompatible()) {
            this.openIncompatibleMapsDialog()
        }
        this.store.dispatch(setDeltaComparison({ file }))
    }

    private openIncompatibleMapsDialog() {
        this.dialog.open(IncompatibleMapsDialogComponent, {
            panelClass: "cc-incompatible-maps-dialog",
            data: {
                referenceFileName$: this.getFileName(this.referenceFile$),
                comparisonFileName$: this.getFileName(this.comparisonFile$)
            }
        })
    }

    private getFileName(file: Observable<CCFile>) {
        return file.pipe(map(file => file.fileMeta.fileName))
    }

    private hasMccMetric(file: Observable<CCFile>) {
        return file.pipe(map(file => file.map.children.some(c => c.attributes["mcc"])))
    }

    switchReferenceAndComparison() {
        this.store.dispatch(switchReferenceAndComparison())
    }

    private areMapsIncompatible() {
        return this.hasMccMetric(this.referenceFile$) !== this.hasMccMetric(this.comparisonFile$)
    }
}
