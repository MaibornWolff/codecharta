import { ChangeDetectionStrategy, Component, input, output, signal } from "@angular/core"
import { MetricDistribution } from "../../../../util/fileExtension/fileExtensionCalculator"
import { HighlightBuildingsByFileExtensionService } from "../../services/highlightBuildingsByFileExtension.service"
import {
    ContextMenuPosition,
    contextMenuPositionAt,
    FileExtensionContextMenuComponent
} from "../fileExtensionContextMenu/fileExtensionContextMenu.component"
import { formatDistributionTitle } from "../formatDistributionTitle"

export interface OthersListAnchor {
    right: number
    bottom: number
}

interface OpenRowMenu {
    fileExtension: string
    position: ContextMenuPosition
}

@Component({
    selector: "cc-file-extension-others-list",
    templateUrl: "./fileExtensionOthersList.component.html",
    imports: [FileExtensionContextMenuComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExtensionOthersListComponent {
    others = input.required<MetricDistribution[]>()
    showAbsoluteValues = input.required<boolean>()
    anchor = input.required<OthersListAnchor>()
    menuOpenChange = output<boolean>()

    readonly openRowMenu = signal<OpenRowMenu | null>(null)

    constructor(private readonly highlightBuildingsByFileExtensionService: HighlightBuildingsByFileExtensionService) {}

    formatTitle(item: MetricDistribution) {
        return formatDistributionTitle(item, this.showAbsoluteValues())
    }

    highlight(fileExtension: string) {
        this.highlightBuildingsByFileExtensionService.highlightExtension(fileExtension)
    }

    clearHighlight() {
        this.highlightBuildingsByFileExtensionService.clearHighlightingOnFileExtensions()
    }

    openMenu(event: MouseEvent, fileExtension: string) {
        event.preventDefault()
        this.openRowMenu.set({ fileExtension, position: contextMenuPositionAt(event) })
        this.menuOpenChange.emit(true)
    }

    closeMenu() {
        this.openRowMenu.set(null)
        this.menuOpenChange.emit(false)
    }
}
