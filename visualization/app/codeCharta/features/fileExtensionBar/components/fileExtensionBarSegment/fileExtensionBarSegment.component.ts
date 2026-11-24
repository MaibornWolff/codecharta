import { ChangeDetectionStrategy, Component, computed, HostBinding, input, output, signal } from "@angular/core"
import { MetricDistribution, NO_EXTENSION } from "../../../../util/fileExtension/fileExtensionCalculator"
import { HighlightBuildingsByFileExtensionService } from "../../services/highlightBuildingsByFileExtension.service"
import { formatDistributionLabel } from "../../util/formatDistributionLabel"
import { FileExtensionMenuComponent, MenuPosition, menuPositionAt } from "../fileExtensionMenu/fileExtensionMenu.component"

@Component({
    selector: "cc-file-extension-bar-segment",
    templateUrl: "./fileExtensionBarSegment.component.html",
    host: { class: "min-w-max cursor-pointer overflow-hidden text-center text-white" },
    imports: [FileExtensionMenuComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExtensionBarSegmentComponent {
    item = input.required<MetricDistribution>()
    showAbsoluteValues = input.required<boolean>()
    toggleShowAbsoluteValues = output<void>()

    readonly menuPosition = signal<MenuPosition | null>(null)

    readonly fileExtension = computed<string>(() => this.item().fileExtension)
    readonly hasFileExtension = computed(() => this.fileExtension() !== NO_EXTENSION)
    readonly formattedTitle = computed(() => formatDistributionLabel(this.item(), this.showAbsoluteValues()))

    constructor(private readonly highlightBuildingsByFileExtensionService: HighlightBuildingsByFileExtensionService) {}

    openContextMenu(event: MouseEvent) {
        event.preventDefault()
        if (!this.hasFileExtension()) {
            return
        }
        this.menuPosition.set(menuPositionAt(event))
    }

    closeContextMenu() {
        this.menuPosition.set(null)
    }

    onHoverFileExtensionBar(hoveredExtension: string) {
        this.highlightBuildingsByFileExtensionService.highlightExtension(hoveredExtension)
    }

    onUnhoverFileExtensionBar() {
        this.highlightBuildingsByFileExtensionService.clearHighlightingOnFileExtensions()
    }

    @HostBinding("style.background-color")
    get backgroundColor() {
        return this.item().color
    }

    @HostBinding("style.flex-grow")
    get flexGrow() {
        return this.item().relativeMetricValue
    }

    @HostBinding("style.flex-basis")
    get flexBasis() {
        return "0"
    }
}
