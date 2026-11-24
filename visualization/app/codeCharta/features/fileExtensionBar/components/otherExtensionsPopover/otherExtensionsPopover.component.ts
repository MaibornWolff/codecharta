import { ChangeDetectionStrategy, Component, inject, input, output, signal } from "@angular/core"
import { MetricDistribution, NO_EXTENSION, OTHER_EXTENSION } from "../../../../util/fileExtension/fileExtensionCalculator"
import { HighlightBuildingsByFileExtensionService } from "../../services/highlightBuildingsByFileExtension.service"
import { formatDistributionValue } from "../../util/formatDistributionLabel"
import { FileExtensionMenuComponent, MenuPosition, menuPositionAt } from "../fileExtensionMenu/fileExtensionMenu.component"

export interface PopoverAnchor {
    right: number
    bottom: number
}

interface OpenMenu {
    fileExtension: string
    position: MenuPosition
}

@Component({
    selector: "cc-other-extensions-popover",
    templateUrl: "./otherExtensionsPopover.component.html",
    imports: [FileExtensionMenuComponent],
    host: {
        class: "fixed z-[90] block max-h-64 w-56 cursor-default overflow-y-auto rounded-box border border-base-300 bg-base-100 py-1 text-left text-xs text-base-content shadow-lg",
        "[style.right.px]": "anchor().right",
        "[style.bottom.px]": "anchor().bottom",
        "(contextmenu)": "$event.preventDefault()"
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtherExtensionsPopoverComponent {
    private readonly highlightBuildingsByFileExtensionService = inject(HighlightBuildingsByFileExtensionService)

    readonly total = input.required<MetricDistribution>()
    readonly items = input.required<MetricDistribution[]>()
    readonly showAbsoluteValues = input.required<boolean>()
    readonly anchor = input.required<PopoverAnchor>()
    readonly menuOpenChange = output<boolean>()

    readonly openMenu = signal<OpenMenu | null>(null)
    readonly otherExtension = OTHER_EXTENSION

    formatValue(item: MetricDistribution) {
        return formatDistributionValue(item, this.showAbsoluteValues())
    }

    hasActions(fileExtension: string) {
        return fileExtension !== NO_EXTENSION
    }

    openMenuFor(fileExtension: string, event: MouseEvent) {
        event.preventDefault()
        if (!this.hasActions(fileExtension)) {
            return
        }
        this.openMenu.set({ fileExtension, position: menuPositionAt(event) })
        this.menuOpenChange.emit(true)
    }

    closeMenu() {
        this.openMenu.set(null)
        this.menuOpenChange.emit(false)
    }

    highlight(fileExtension: string) {
        this.highlightBuildingsByFileExtensionService.highlightExtension(fileExtension)
    }

    clearHighlight() {
        this.highlightBuildingsByFileExtensionService.clearHighlightingOnFileExtensions()
    }
}
