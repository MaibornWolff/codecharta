import { ChangeDetectionStrategy, Component, computed, ElementRef, HostBinding, inject, input, output, signal } from "@angular/core"
import { MetricDistribution, NO_EXTENSION } from "../../../../util/fileExtension/fileExtensionCalculator"
import { HighlightBuildingsByFileExtensionService } from "../../services/highlightBuildingsByFileExtension.service"
import { formatDistributionLabel } from "../../util/formatDistributionLabel"
import { ExtensionMenuRequest, FileExtensionMenuComponent, menuPositionAt } from "../fileExtensionMenu/fileExtensionMenu.component"
import { OtherExtensionsPopoverComponent, PopoverAnchor } from "../otherExtensionsPopover/otherExtensionsPopover.component"

interface OpenMenu extends ExtensionMenuRequest {
    isFromPopover: boolean
}

@Component({
    selector: "cc-file-extension-bar-segment",
    templateUrl: "./fileExtensionBarSegment.component.html",
    host: {
        class: "min-w-max cursor-pointer overflow-hidden text-center text-white",
        "(mouseenter)": "onPointerEnter()",
        "(mouseleave)": "isPointerInside.set(false)"
    },
    imports: [FileExtensionMenuComponent, OtherExtensionsPopoverComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExtensionBarSegmentComponent {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef)

    item = input.required<MetricDistribution>()
    showAbsoluteValues = input.required<boolean>()
    groupedItems = input<MetricDistribution[]>([])
    toggleShowAbsoluteValues = output<void>()

    readonly openMenu = signal<OpenMenu | null>(null)
    readonly isPointerInside = signal(false)
    readonly popoverAnchor = signal<PopoverAnchor | null>(null)
    readonly isPopoverShown = computed(() => {
        if (this.groupedItems().length === 0) {
            return false
        }
        const menu = this.openMenu()
        return menu ? menu.isFromPopover : this.isPointerInside()
    })

    readonly fileExtension = computed<string>(() => this.item().fileExtension)
    readonly hasFileExtension = computed(() => this.fileExtension() !== NO_EXTENSION)
    readonly formattedTitle = computed(() => formatDistributionLabel(this.item(), this.showAbsoluteValues()))

    constructor(private readonly highlightBuildingsByFileExtensionService: HighlightBuildingsByFileExtensionService) {}

    openContextMenu(event: MouseEvent) {
        event.preventDefault()
        if (!this.hasFileExtension()) {
            return
        }
        this.openMenu.set({ fileExtension: this.fileExtension(), position: menuPositionAt(event), isFromPopover: false })
    }

    openPopoverMenu(request: ExtensionMenuRequest) {
        this.openMenu.set({ ...request, isFromPopover: true })
    }

    closeContextMenu() {
        this.openMenu.set(null)
    }

    onPointerEnter() {
        const segmentBounds = this.elementRef.nativeElement.getBoundingClientRect()
        this.popoverAnchor.set({ right: window.innerWidth - segmentBounds.right, bottom: window.innerHeight - segmentBounds.top })
        this.isPointerInside.set(true)
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
