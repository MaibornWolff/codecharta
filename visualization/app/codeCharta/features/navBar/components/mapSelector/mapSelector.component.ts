import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CCFile } from "../../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../../model/files/files"
import { RemoveExtensionPipe } from "../../removeExtension.pipe"
import { FilesSelectionStore } from "../../stores/filesSelection.store"

type FileRemovedInUIState = {
    file: CCFile
    isRemoved: boolean
}

@Component({
    selector: "cc-map-selector",
    templateUrl: "./mapSelector.component.html",
    imports: [RemoveExtensionPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapSelectorComponent {
    private readonly filesSelectionStore = inject(FilesSelectionStore)
    private readonly elementRef = inject(ElementRef<HTMLElement>)

    private readonly filesInStore = toSignal(this.filesSelectionStore.files$, { requireSync: true })

    isOpen = signal(false)
    filesInUI = signal<FileRemovedInUIState[]>([])
    selectedFilesInUI = signal<CCFile[]>([])

    triggerLabel = computed(() => {
        const selected = this.selectedFilesInStore()
        if (selected.length === 0) {
            return "Select map"
        }
        if (selected.length === 1) {
            return this.withoutExtension(selected[0].fileMeta.fileName)
        }
        return `${this.withoutExtension(selected[0].fileMeta.fileName)} +${selected.length - 1}`
    })

    applyButtonState = computed(() => {
        if (this.selectedFilesInUI().length === 0) {
            return { disabled: true, tooltip: "Select at least one map" }
        }
        if (this.uiSelectionDiffersFromStore()) {
            return { disabled: false, tooltip: "" }
        }
        return { disabled: true, tooltip: "No changes to apply" }
    })

    constructor() {
        this.syncFromStore(this.filesInStore())
    }

    @HostListener("document:click", ["$event"])
    handleDocumentClick(event: MouseEvent) {
        if (!this.isOpen()) {
            return
        }
        const target = event.target as Node
        if (!this.elementRef.nativeElement.contains(target)) {
            this.closeWithoutApplying()
        }
    }

    toggleOpen() {
        if (this.isOpen()) {
            this.closeWithoutApplying()
        } else {
            this.syncFromStore(this.filesInStore())
            this.isOpen.set(true)
        }
    }

    handleCheckboxChange(file: CCFile, checked: boolean) {
        const current = this.selectedFilesInUI()
        if (checked) {
            if (!current.includes(file)) {
                this.selectedFilesInUI.set([...current, file])
            }
            this.filesInUI.update(files => files.map(item => (item.file === file ? { file: item.file, isRemoved: false } : item)))
        } else {
            this.selectedFilesInUI.set(current.filter(selected => selected !== file))
        }
    }

    handleRemoveFileToggle(file: CCFile, event: MouseEvent) {
        event.stopPropagation()
        event.preventDefault()
        this.filesInUI.update(files =>
            files.map(item =>
                item.file.fileMeta.fileName === file.fileMeta.fileName ? { file: item.file, isRemoved: !item.isRemoved } : item
            )
        )
        this.selectedFilesInUI.update(selected =>
            selected.filter(selectedFile => selectedFile.fileMeta.fileName !== file.fileMeta.fileName)
        )
    }

    handleSelectAll() {
        this.selectedFilesInUI.set(
            this.filesInUI()
                .filter(file => !file.isRemoved)
                .map(file => file.file)
        )
    }

    handleSelectNone() {
        this.selectedFilesInUI.set([])
    }

    handleSelectInvert() {
        const notRemoved = this.filesInUI().filter(file => !file.isRemoved)
        if (notRemoved.length === 0) {
            return
        }
        const selected = this.selectedFilesInUI()
        if (selected.length === 0) {
            this.selectedFilesInUI.set(notRemoved.map(file => file.file))
        } else if (selected.length === notRemoved.length) {
            this.selectedFilesInUI.set([])
        } else {
            this.selectedFilesInUI.set(notRemoved.filter(file => !selected.includes(file.file)).map(file => file.file))
        }
    }

    handleApply() {
        const filesToRemove = this.filesInUI()
            .filter(file => file.isRemoved)
            .map(file => file.file.fileMeta.fileName)
        this.filesSelectionStore.setStandard(this.selectedFilesInUI())
        this.filesSelectionStore.removeFiles(filesToRemove)
        this.isOpen.set(false)
    }

    private closeWithoutApplying() {
        this.syncFromStore(this.filesInStore())
        this.isOpen.set(false)
    }

    private syncFromStore(fileStates: FileState[]) {
        this.filesInUI.set(fileStates.map(file => ({ file: file.file, isRemoved: false })))
        this.selectedFilesInUI.set(fileStates.filter(file => file.selectedAs === FileSelectionState.Partial).map(file => file.file))
    }

    private selectedFilesInStore(): CCFile[] {
        return this.filesInStore()
            .filter(file => file.selectedAs === FileSelectionState.Partial)
            .map(file => file.file)
    }

    private uiSelectionDiffersFromStore(): boolean {
        if (this.filesInUI().some(file => file.isRemoved)) {
            return true
        }
        const selectedInStore = this.selectedFilesInStore()
        const selectedInUI = this.selectedFilesInUI()
        if (selectedInUI.length !== selectedInStore.length) {
            return true
        }
        return !selectedInUI.every(file => selectedInStore.includes(file))
    }

    private withoutExtension(fileName: string): string {
        return new RemoveExtensionPipe().transform(fileName)
    }

    isFileSelected(file: CCFile): boolean {
        return this.selectedFilesInUI().includes(file)
    }
}
