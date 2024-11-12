import { Component, OnDestroy, ViewChild } from "@angular/core"
import { filesSelector } from "../../../state/store/files/files.selector"
import { removeFiles, setStandard } from "../../../state/store/files/files.actions"
import { CCFile, CcState } from "../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { Store } from "@ngrx/store"
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"
import { RemoveExtensionPipe } from "../../../util/pipes/removeExtension.pipe"
import { take } from "rxjs"
import { RemoveOrAddFileButtonComponent } from "./removeOrAddFileButton/removeOrAddFileButton.component"
import { NgStyle } from "@angular/common"
import { MatTooltip } from "@angular/material/tooltip"

type FileRemovedInUIState = {
    file: CCFile
    isRemoved: boolean
}

@Component({
    selector: "cc-file-panel-file-selector",
    templateUrl: "./filePanelFileSelector.component.html",
    styleUrls: ["./filePanelFileSelector.component.scss"],
    standalone: true,
    imports: [MatSelect, MatOption, RemoveOrAddFileButtonComponent, RemoveExtensionPipe, NgStyle, MatTooltip]
})
export class FilePanelFileSelectorComponent implements OnDestroy {
    @ViewChild("fileSelect") select: MatSelect

    filesInUI: FileRemovedInUIState[] = []
    selectedFilesInUI: CCFile[] = []
    filesInStore: FileState[] = []
    private closedByApply = false

    applyButtonTooltip = ""
    applyButtonDisabled = false

    private readonly filesSubscription = this.store.select(filesSelector).subscribe(fileStates => {
        this.filesInStore = fileStates
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
        this.updateApplyButtonState()
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

        if (opened) {
            this.setApplyButtonStateToNoChangesToApply()
        }
    }

    handleSelectZeroFiles() {
        this.selectedFilesInUI = []
        this.setApplyButtonStateToNoMapSelected()
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

        this.updateApplyButtonState()
    }

    handleSelectAllFiles() {
        this.selectedFilesInUI = this.filesInUI.filter(file => !file.isRemoved).map(file => file.file)
        this.updateApplyButtonState()
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
        this.updateApplyButtonState()
    }

    private updateApplyButtonState() {
        if (this.selectedFilesInUI.length === 0) {
            this.setApplyButtonStateToNoMapSelected()
            return
        }

        const uiDiffersFromStore = this.uiSelectionDiffersFromStore()
        if (uiDiffersFromStore) {
            this.setApplyButtonStateEnabled()
        } else {
            this.setApplyButtonStateToNoChangesToApply()
        }
    }

    private setApplyButtonStateToNoChangesToApply() {
        this.applyButtonTooltip = "No changes to apply"
        this.applyButtonDisabled = true
    }

    private setApplyButtonStateToNoMapSelected() {
        this.applyButtonTooltip = "Select at least one map"
        this.applyButtonDisabled = true
    }

    private setApplyButtonStateEnabled() {
        this.applyButtonTooltip = ""
        this.applyButtonDisabled = false
    }

    private uiSelectionDiffersFromStore() {
        if (this.filesInUI.some(file => file.isRemoved)) {
            return true
        }

        const selectedFilesInStore = this.filesInStore.filter(file => file.selectedAs === FileSelectionState.Partial).map(file => file.file)
        if (this.selectedFilesInUI.length !== selectedFilesInStore.length) {
            return true
        }

        return !this.selectedFilesInUI.every(file => selectedFilesInStore.includes(file)) //this combined with the assumption that the arrays are the same length and no file can appear more than once is enough to determine if the arrays have the same content
    }
}
