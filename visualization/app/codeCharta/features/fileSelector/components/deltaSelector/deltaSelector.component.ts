import { Component, computed, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CCFile, CodeMapNode } from "../../../../codeCharta.model"
import { FileSelectionState } from "../../../../model/files/files"
import { FilesService } from "../../services/files.service"
import { RemoveExtensionPipe } from "../../../../util/pipes/removeExtension.pipe"

export const ALERT_ON_INCOMPATIBLE_MAPS = "alertOnIncompatibleMaps"

type IncompatibleMapsDialogData = {
    referenceFileName: string
    comparisonFileName: string
    fileWithMccMetric: string
}

@Component({
    selector: "cc-delta-selector",
    templateUrl: "./deltaSelector.component.html",
    imports: [RemoveExtensionPipe]
})
export class DeltaSelectorComponent {
    private readonly filesFromStore = toSignal(this.filesService.files$(), { initialValue: [] })
    private readonly pictogramBackgroundFromStore = toSignal(this.filesService.pictogramBackground$(), { initialValue: "" })

    files = computed(() => this.filesFromStore())

    referenceFile = computed(() => this.filesFromStore().find(file => file.selectedAs === FileSelectionState.Reference)?.file)

    comparisonFile = computed(() => this.filesFromStore().find(file => file.selectedAs === FileSelectionState.Comparison)?.file)

    possibleComparisonFiles = computed(() => this.filesFromStore().filter(file => file.selectedAs !== FileSelectionState.Reference))

    pictogramBackground = computed(() => this.pictogramBackgroundFromStore())

    dialogOpen = signal(false)
    dialogData = signal<IncompatibleMapsDialogData | null>(null)
    doNotShowAgain = signal(false)

    constructor(private readonly filesService: FilesService) {}

    handleDeltaReferenceFileChange(event: Event) {
        const select = event.target as HTMLSelectElement
        const fileName = select.value
        const file = this.files().find(f => f.file.fileMeta.fileName === fileName)?.file
        if (file) {
            this.filesService.setDeltaReference(file)
            this.showAlertWhenFilesAreIncompatible()
        }
    }

    handleDeltaComparisonFileChange(event: Event) {
        const select = event.target as HTMLSelectElement
        const fileName = select.value
        const file = this.files().find(f => f.file.fileMeta.fileName === fileName)?.file
        if (file) {
            this.filesService.setDeltaComparison(file)
            this.showAlertWhenFilesAreIncompatible()
        }
    }

    switchReferenceAndComparison() {
        this.filesService.switchReferenceAndComparison()
    }

    closeDialog() {
        if (this.doNotShowAgain()) {
            localStorage.setItem(ALERT_ON_INCOMPATIBLE_MAPS, JSON.stringify(false))
        }
        this.dialogOpen.set(false)
        this.doNotShowAgain.set(false)
    }

    toggleDoNotShowAgain(event: Event) {
        const checkbox = event.target as HTMLInputElement
        this.doNotShowAgain.set(checkbox.checked)
    }

    private showAlertWhenFilesAreIncompatible() {
        if (this.alertOnIncompatibleMaps() && this.areMapsIncompatible()) {
            this.openIncompatibleMapsDialog()
        }
    }

    private alertOnIncompatibleMaps() {
        const stored = localStorage.getItem(ALERT_ON_INCOMPATIBLE_MAPS)
        return stored ? JSON.parse(stored) === true : true
    }

    private openIncompatibleMapsDialog() {
        const reference = this.referenceFile()
        const comparison = this.comparisonFile()
        this.dialogData.set({
            referenceFileName: this.getFileName(reference),
            comparisonFileName: this.getFileName(comparison),
            fileWithMccMetric: this.getFileWithMccMetric(reference, comparison)
        })
        this.dialogOpen.set(true)
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
        return ""
    }

    private areMapsIncompatible() {
        const reference = this.referenceFile()
        const comparison = this.comparisonFile()
        if (reference && comparison) {
            return this.hasMccMetric(reference) !== this.hasMccMetric(comparison)
        }
        return false
    }
}
