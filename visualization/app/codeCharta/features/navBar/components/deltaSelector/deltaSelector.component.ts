import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CCFile } from "../../../../codeCharta.model"
import { FileSelectionState } from "../../../../model/files/files"
import { RemoveExtensionPipe } from "../../../../util/pipes/removeExtension.pipe"
import { FilesSelectionStore } from "../../stores/filesSelection.store"

type OpenDropdown = "none" | "reference" | "comparison"

@Component({
    selector: "cc-delta-selector",
    templateUrl: "./deltaSelector.component.html",
    imports: [RemoveExtensionPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeltaSelectorComponent {
    private readonly filesSelectionStore = inject(FilesSelectionStore)
    private readonly elementRef = inject(ElementRef<HTMLElement>)

    private readonly fileStates = toSignal(this.filesSelectionStore.files$, { requireSync: true })
    private readonly referenceFile = toSignal(this.filesSelectionStore.referenceFile$, { requireSync: true })

    openDropdown = signal<OpenDropdown>("none")

    referenceLabel = computed(() => {
        const file = this.referenceFile()
        return file ? this.withoutExtension(file.fileMeta.fileName) : "select reference file"
    })

    comparisonFile = computed<CCFile | undefined>(
        () => this.fileStates().find(state => state.selectedAs === FileSelectionState.Comparison)?.file
    )

    comparisonLabel = computed(() => {
        const file = this.comparisonFile()
        return file ? this.withoutExtension(file.fileMeta.fileName) : "select comparison file"
    })

    referenceOptions = computed<CCFile[]>(() => this.fileStates().map(state => state.file))

    comparisonOptions = computed<CCFile[]>(() =>
        this.fileStates()
            .filter(state => state.selectedAs !== FileSelectionState.Reference)
            .map(state => state.file)
    )

    swapDisabled = computed(() => this.comparisonFile() === undefined)

    @HostListener("document:click", ["$event"])
    handleDocumentClick(event: MouseEvent) {
        if (this.openDropdown() === "none") {
            return
        }
        if (!this.elementRef.nativeElement.contains(event.target as Node)) {
            this.openDropdown.set("none")
        }
    }

    toggleDropdown(which: Exclude<OpenDropdown, "none">) {
        this.openDropdown.update(current => (current === which ? "none" : which))
    }

    handleReferenceChange(file: CCFile) {
        this.filesSelectionStore.setDeltaReference(file)
        this.openDropdown.set("none")
    }

    handleComparisonChange(file: CCFile) {
        this.filesSelectionStore.setDeltaComparison(file)
        this.openDropdown.set("none")
    }

    handleSwap() {
        if (this.swapDisabled()) {
            return
        }
        this.filesSelectionStore.switchReferenceAndComparison()
    }

    isReferenceSelected(file: CCFile): boolean {
        return this.referenceFile()?.fileMeta.fileName === file.fileMeta.fileName
    }

    isComparisonSelected(file: CCFile): boolean {
        return this.comparisonFile()?.fileMeta.fileName === file.fileMeta.fileName
    }

    private withoutExtension(fileName: string): string {
        return new RemoveExtensionPipe().transform(fileName)
    }
}
