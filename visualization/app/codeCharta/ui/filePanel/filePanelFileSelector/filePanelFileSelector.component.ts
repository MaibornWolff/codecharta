import { Component, OnDestroy, ViewChild } from "@angular/core"
import { filesSelector } from "../../../state/store/files/files.selector"
import { removeFiles, setStandard } from "../../../state/store/files/files.actions"
import { CCFile, CcState } from "../../../codeCharta.model"
import { FileSelectionState } from "../../../model/files/files"
import { Store } from "@ngrx/store"
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"
import { RemoveExtensionPipe } from "../../../util/pipes/removeExtension.pipe"
import { take } from "rxjs"
import { RemoveOrAddFileButtonComponent } from "./removeFileButton/removeOrAddFileButton.component"

type FileRemovedInUIState = {
    file: CCFile
    isRemoved: boolean
}

@Component({
    selector: "cc-file-panel-file-selector",
    templateUrl: "./filePanelFileSelector.component.html",
    styleUrls: ["./filePanelFileSelector.component.scss"],
    standalone: true,
    imports: [MatSelect, MatOption, RemoveOrAddFileButtonComponent, RemoveExtensionPipe]
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
        const notRemovedFiles = this.filesInUI.filter(file => !file.isRemoved)
        if (notRemovedFiles.length === 0) {
            return
        }

        if (this.selectedFilesInUI.length === 0) {
            this.selectedFilesInUI = notRemovedFiles.map(file => file.file)
        } else if (this.selectedFilesInUI.length === notRemovedFiles.length) {
            this.selectedFilesInUI = []
        } else {
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
