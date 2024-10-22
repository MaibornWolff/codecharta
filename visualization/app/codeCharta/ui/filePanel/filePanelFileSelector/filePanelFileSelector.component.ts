import { Component, OnDestroy, ViewChild } from "@angular/core"
import { filesSelector } from "../../../state/store/files/files.selector"
import { removeFiles, setStandard } from "../../../state/store/files/files.actions"
import { CCFile, CcState } from "../../../codeCharta.model"
import { FileSelectionState } from "../../../model/files/files"
import { Store } from "@ngrx/store"
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"
import { RemoveFileButtonComponent } from "./removeFileButton/removeFileButton.component"
import { RemoveExtensionPipe } from "../../../util/pipes/removeExtension.pipe"
import { take } from "rxjs"

type FileRemovedInUIState = {
    file: CCFile
    isRemoved: boolean
}

@Component({
    selector: "cc-file-panel-file-selector",
    templateUrl: "./filePanelFileSelector.component.html",
    styleUrls: ["./filePanelFileSelector.component.scss"],
    standalone: true,
    imports: [MatSelect, MatOption, RemoveFileButtonComponent, RemoveExtensionPipe]
})
export class FilePanelFileSelectorComponent implements OnDestroy {
    @ViewChild("fileSelect") select: MatSelect

    filesInUI: FileRemovedInUIState[] = []
    selectedFilesInUI: CCFile[] = []
    private closedByApply = false

    private readonly filesSubscription = this.store.select(filesSelector).subscribe(fileStates => {
        this.filesInUI = fileStates.map(file => ({ file: file.file, isRemoved: false }))
        this.selectedFilesInUI = fileStates.filter(file => file.selectedAs === FileSelectionState.Partial).map(file => file.file)
    })

    constructor(private readonly store: Store<CcState>) {}

    ngOnDestroy(): void {
        this.filesSubscription.unsubscribe()
    }

    handleSelectedFilesChanged(selectedFiles: CCFile[]) {
        this.selectedFilesInUI = selectedFiles
        for (const file of this.filesInUI) {
            if (selectedFiles.includes(file.file)) {
                file.isRemoved = false
            }
        }
    }

    handleOpenedChanged(opened: boolean) {
        if (!this.closedByApply && !opened) {
            this.store
                .select(filesSelector)
                .pipe(take(1))
                .subscribe(fileStates => {
                    this.filesInUI = fileStates.map(file => ({ file: file.file, isRemoved: false }))
                    this.selectedFilesInUI = fileStates
                        .filter(file => file.selectedAs === FileSelectionState.Partial)
                        .map(file => file.file)
                })
        } else {
            this.closedByApply = false
        }
    }

    handleSelectZeroFiles() {
        this.selectedFilesInUI = []
    }

    handleInvertSelectedFiles() {
        if (this.filesInUI.length === 0) {
            this.selectedFilesInUI = this.filesInUI.filter(file => !file.isRemoved).map(file => file.file)
        } else if (this.selectedFilesInUI.length === this.filesInUI.length) {
            this.selectedFilesInUI = []
        } else {
            const notRemovedFiles = this.filesInUI.filter(file => !file.isRemoved)
            this.selectedFilesInUI = notRemovedFiles.filter(file => !this.selectedFilesInUI.includes(file.file)).map(file => file.file)
        }
    }

    handleSelectAllFiles() {
        this.selectedFilesInUI = this.filesInUI.filter(file => !file.isRemoved).map(file => file.file)
    }

    handleApplyFileChanges() {
        const fileNamesToRemove = this.filesInUI.filter(file => file.isRemoved).map(file => file.file.fileMeta.fileName)
        this.store.dispatch(setStandard({ files: this.selectedFilesInUI }))
        this.store.dispatch(removeFiles({ fileNames: fileNamesToRemove }))
        this.closedByApply = true
        this.select.close()
    }

    handleAddOrRemoveFile(fileName: string) {
        this.filesInUI = this.filesInUI.map(file =>
            file.file.fileMeta.fileName === fileName ? { file: file.file, isRemoved: !file.isRemoved } : file
        )
        this.selectedFilesInUI = this.selectedFilesInUI.filter(file => file.fileMeta.fileName !== fileName)
    }
}
