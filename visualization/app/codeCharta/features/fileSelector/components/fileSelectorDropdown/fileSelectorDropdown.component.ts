import { Component, computed, effect, ElementRef, HostListener, signal, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CCFile } from "../../../../codeCharta.model"
import { FileSelectionState } from "../../../../model/files/files"
import { FilesService } from "../../services/files.service"
import { RemoveExtensionPipe } from "../../../../util/pipes/removeExtension.pipe"
import { FileNameHelper } from "../../../../util/fileNameHelper"

type FileRemovedInUIState = {
    file: CCFile
    isRemoved: boolean
}

@Component({
    selector: "cc-file-selector-dropdown",
    templateUrl: "./fileSelectorDropdown.component.html",
    imports: [RemoveExtensionPipe]
})
export class FileSelectorDropdownComponent {
    private readonly dropdownContent = viewChild<ElementRef<HTMLDetailsElement>>("dropdownDetails")

    @HostListener("document:click", ["$event"])
    onDocumentClick(event: MouseEvent) {
        const details = this.dropdownContent()?.nativeElement
        if (details?.open && !details.contains(event.target as Node)) {
            details.open = false
            this.resetToStoreState()
        }
    }

    @HostListener("document:keydown.escape")
    onEscapeKey() {
        const details = this.dropdownContent()?.nativeElement
        if (details?.open) {
            details.open = false
            this.resetToStoreState()
        }
    }

    private readonly filesFromStore = toSignal(this.filesService.files$(), { initialValue: [] })

    filesInUI = signal<FileRemovedInUIState[]>([])
    selectedFileNames = signal<Set<string>>(new Set())

    private readonly applyTooltipMessages = {
        noChanges: "No changes to apply",
        noMapSelected: "Select at least one map"
    } as const

    applyButtonTooltip = signal("")
    applyButtonDisabled = signal(true)

    displayText = computed(() => {
        const selectedNames = this.selectedFileNames()
        const selectedCount = selectedNames.size
        if (selectedCount === 0) {
            return "No files selected"
        }
        const sortedNames = [...selectedNames].sort().map(name => FileNameHelper.withoutCCExtension(name))
        return sortedNames.join(", ")
    })

    constructor(private readonly filesService: FilesService) {
        effect(() => {
            const fileStates = this.filesFromStore()
            if (!fileStates || fileStates.length === 0) {
                return
            }
            this.filesInUI.set(fileStates.map(file => ({ file: file.file, isRemoved: false })))
            const selectedNames = new Set(
                fileStates.filter(file => file.selectedAs === FileSelectionState.Partial).map(file => file.file.fileMeta.fileName)
            )
            this.selectedFileNames.set(selectedNames)
        })
    }

    isFileSelected(fileName: string): boolean {
        return this.selectedFileNames().has(fileName)
    }

    handleFileToggle(fileName: string, checked: boolean) {
        const file = this.filesInUI().find(f => f.file.fileMeta.fileName === fileName)
        if (file?.isRemoved) {
            return
        }

        const newSelected = new Set(this.selectedFileNames())
        if (checked) {
            newSelected.add(fileName)
        } else {
            newSelected.delete(fileName)
        }
        this.selectedFileNames.set(newSelected)
        this.updateApplyButtonState()
    }

    handleSelectAllFiles() {
        const allFileNames = this.filesInUI()
            .filter(file => !file.isRemoved)
            .map(file => file.file.fileMeta.fileName)
        this.selectedFileNames.set(new Set(allFileNames))
        this.updateApplyButtonState()
    }

    handleSelectZeroFiles() {
        this.selectedFileNames.set(new Set())
        this.setApplyButtonStateToNoMapSelected()
    }

    handleInvertSelectedFiles() {
        const notRemovedFiles = this.filesInUI().filter(file => !file.isRemoved)
        if (notRemovedFiles.length === 0) {
            return
        }

        const currentSelected = this.selectedFileNames()
        if (currentSelected.size === 0) {
            this.selectedFileNames.set(new Set(notRemovedFiles.map(file => file.file.fileMeta.fileName)))
        } else if (currentSelected.size === notRemovedFiles.length) {
            this.selectedFileNames.set(new Set())
        } else {
            const inverted = notRemovedFiles
                .filter(file => !currentSelected.has(file.file.fileMeta.fileName))
                .map(f => f.file.fileMeta.fileName)
            this.selectedFileNames.set(new Set(inverted))
        }
        this.updateApplyButtonState()
    }

    handleAddOrRemoveFile(fileName: string, event: MouseEvent) {
        event.stopPropagation()
        event.preventDefault()

        const updatedFiles = this.filesInUI().map(file =>
            file.file.fileMeta.fileName === fileName ? { file: file.file, isRemoved: !file.isRemoved } : file
        )
        this.filesInUI.set(updatedFiles)

        const newSelected = new Set(this.selectedFileNames())
        newSelected.delete(fileName)
        this.selectedFileNames.set(newSelected)

        this.updateApplyButtonState()
    }

    handleApplyFileChanges() {
        const fileNamesToRemove = this.filesInUI()
            .filter(file => file.isRemoved)
            .map(file => file.file.fileMeta.fileName)
        const selectedFiles = this.filesInUI()
            .filter(file => this.selectedFileNames().has(file.file.fileMeta.fileName))
            .map(file => file.file)

        this.filesService.setStandard(selectedFiles)
        this.filesService.removeFiles(fileNamesToRemove)

        this.closeDropdown()
    }

    handleDropdownToggle(event: Event) {
        const details = event.target as HTMLDetailsElement
        if (details.open) {
            this.setApplyButtonStateToNoChangesToApply()
        } else {
            this.resetToStoreState()
        }
    }

    private closeDropdown() {
        const details = this.dropdownContent()?.nativeElement
        if (details) {
            details.open = false
        }
    }

    private resetToStoreState() {
        const fileStates = this.filesFromStore()
        if (!fileStates || fileStates.length === 0) {
            return
        }
        this.filesInUI.set(fileStates.map(file => ({ file: file.file, isRemoved: false })))
        const selectedNames = new Set(
            fileStates.filter(file => file.selectedAs === FileSelectionState.Partial).map(file => file.file.fileMeta.fileName)
        )
        this.selectedFileNames.set(selectedNames)
    }

    private updateApplyButtonState() {
        if (this.selectedFileNames().size === 0) {
            this.setApplyButtonStateToNoMapSelected()
            return
        }

        if (this.uiSelectionDiffersFromStore()) {
            this.setApplyButtonStateEnabled()
        } else {
            this.setApplyButtonStateToNoChangesToApply()
        }
    }

    private setApplyButtonStateToNoChangesToApply() {
        this.applyButtonTooltip.set(this.applyTooltipMessages.noChanges)
        this.applyButtonDisabled.set(true)
    }

    private setApplyButtonStateToNoMapSelected() {
        this.applyButtonTooltip.set(this.applyTooltipMessages.noMapSelected)
        this.applyButtonDisabled.set(true)
    }

    private setApplyButtonStateEnabled() {
        this.applyButtonTooltip.set("")
        this.applyButtonDisabled.set(false)
    }

    private uiSelectionDiffersFromStore(): boolean {
        if (this.filesInUI().some(file => file.isRemoved)) {
            return true
        }

        const selectedFilesInStore = this.filesFromStore()
            .filter(file => file.selectedAs === FileSelectionState.Partial)
            .map(file => file.file.fileMeta.fileName)
        const currentSelected = this.selectedFileNames()

        if (currentSelected.size !== selectedFilesInStore.length) {
            return true
        }

        return !selectedFilesInStore.every(fileName => currentSelected.has(fileName))
    }
}
