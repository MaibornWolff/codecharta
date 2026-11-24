import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core"
import { MetricDistribution, NO_EXTENSION, OTHER_EXTENSION } from "../../../../util/fileExtension/fileExtensionCalculator"
import { HighlightBuildingsByFileExtensionService } from "../../services/highlightBuildingsByFileExtension.service"
import { formatDistributionValue } from "../../util/formatDistributionLabel"
import { ExtensionMenuRequest, menuPositionAt } from "../fileExtensionMenu/fileExtensionMenu.component"

export interface PopoverAnchor {
    right: number
    bottom: number
}

@Component({
    selector: "cc-other-extensions-popover",
    templateUrl: "./otherExtensionsPopover.component.html",
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
    readonly menuRequested = output<ExtensionMenuRequest>()

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
        this.menuRequested.emit({ fileExtension, position: menuPositionAt(event) })
    }

    highlight(fileExtension: string) {
        this.highlightBuildingsByFileExtensionService.highlightExtension(fileExtension)
    }

    clearHighlight() {
        this.highlightBuildingsByFileExtensionService.clearHighlightingOnFileExtensions()
    }
}
