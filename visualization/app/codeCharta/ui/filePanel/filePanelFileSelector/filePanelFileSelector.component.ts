import { Component, OnDestroy } from "@angular/core"
import { filesSelector } from "../../../state/store/files/files.selector"
import { invertStandard, setAll, setStandard } from "../../../state/store/files/files.actions"
import { CCFile, CcState } from "../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { Store } from "@ngrx/store"
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"
import { RemoveFileButtonComponent } from "./removeFileButton/removeFileButton.component"
import { RemoveExtensionPipe } from "../../../util/pipes/removeExtension.pipe"

@Component({
    selector: "cc-file-panel-file-selector",
    templateUrl: "./filePanelFileSelector.component.html",
    styleUrls: ["./filePanelFileSelector.component.scss"],
    standalone: true,
    imports: [MatSelect, MatOption, RemoveFileButtonComponent, RemoveExtensionPipe]
})
export class FilePanelFileSelectorComponent implements OnDestroy {
    fileStates: FileState[] = []
    selectedFilesInUI: CCFile[] = []
    selectedFilesInStore: CCFile[] = []
    private filesSubscription = this.store.select(filesSelector).subscribe(files => {
        this.fileStates = files
        this.selectedFilesInStore = files.filter(file => file.selectedAs === FileSelectionState.Partial).map(file => file.file)
        this.selectedFilesInUI = this.selectedFilesInStore
    })

    constructor(private store: Store<CcState>) {}

    ngOnDestroy(): void {
        this.filesSubscription.unsubscribe()
    }

    handleSelectedFilesChanged(selectedFiles: CCFile[]) {
        this.selectedFilesInUI = selectedFiles
        if (selectedFiles.length > 0) {
            this.store.dispatch(setStandard({ files: selectedFiles }))
        }
    }

    handleOpenedChanged(isOpen: boolean) {
        if (!isOpen) {
            this.selectedFilesInUI = this.selectedFilesInStore
        }
    }

    handleSelectZeroFiles() {
        this.selectedFilesInUI = []
    }

    handleInvertSelectedFiles() {
        if (this.selectedFilesInUI.length === this.fileStates.length) {
            this.selectedFilesInUI = []
        } else {
            this.store.dispatch(invertStandard())
        }
    }

    handleSelectAllFiles() {
        this.store.dispatch(setAll())
    }
}
