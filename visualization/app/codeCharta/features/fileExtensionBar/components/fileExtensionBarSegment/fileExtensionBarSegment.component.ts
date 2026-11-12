import { ChangeDetectionStrategy, Component, computed, ElementRef, HostBinding, HostListener, input, output, signal } from "@angular/core"
import { MetricDistribution, NO_EXTENSION, OTHER_EXTENSION } from "../../../../util/fileExtension/fileExtensionCalculator"
import { HighlightBuildingsByFileExtensionService } from "../../services/highlightBuildingsByFileExtension.service"
import {
    ContextMenuPosition,
    contextMenuPositionAt,
    FileExtensionContextMenuComponent
} from "../fileExtensionContextMenu/fileExtensionContextMenu.component"
import { FileExtensionOthersListComponent, OthersListAnchor } from "../fileExtensionOthersList/fileExtensionOthersList.component"
import { formatDistributionTitle } from "../formatDistributionTitle"

@Component({
    selector: "cc-file-extension-bar-segment",
    templateUrl: "./fileExtensionBarSegment.component.html",
    imports: [FileExtensionContextMenuComponent, FileExtensionOthersListComponent],
    host: { class: "min-w-max cursor-pointer overflow-hidden text-center text-white" },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExtensionBarSegmentComponent {
    item = input.required<MetricDistribution>()
    showAbsoluteValues = input.required<boolean>()
    others = input<MetricDistribution[]>([])
    toggleShowAbsoluteValues = output<void>()

    readonly menuPosition = signal<ContextMenuPosition | null>(null)
    readonly othersListAnchor = signal<OthersListAnchor>({ right: 0, bottom: 0 })
    readonly isPointerInside = signal(false)
    readonly isOthersListMenuOpen = signal(false)

    readonly fileExtension = computed<string>(() => this.item().fileExtension)
    readonly hasFileExtension = computed(() => this.fileExtension() !== NO_EXTENSION)
    readonly formattedTitle = computed(() => formatDistributionTitle(this.item(), this.showAbsoluteValues()))
    readonly hasOthersList = computed(() => this.fileExtension() === OTHER_EXTENSION && this.others().length > 0)
    readonly isOthersListVisible = computed(
        () => this.hasOthersList() && (this.isPointerInside() || this.isOthersListMenuOpen()) && !this.menuPosition()
    )

    constructor(
        private readonly highlightBuildingsByFileExtensionService: HighlightBuildingsByFileExtensionService,
        private readonly elementRef: ElementRef<HTMLElement>
    ) {}

    @HostListener("mouseenter")
    onPointerEnter() {
        const segmentBounds = this.elementRef.nativeElement.getBoundingClientRect()
        this.othersListAnchor.set({
            right: Math.max(0, window.innerWidth - segmentBounds.right),
            bottom: window.innerHeight - segmentBounds.top
        })
        this.isPointerInside.set(true)
    }

    @HostListener("mouseleave")
    onPointerLeave() {
        this.isPointerInside.set(false)
    }

    setOthersListMenuOpen(isOpen: boolean) {
        this.isOthersListMenuOpen.set(isOpen)
    }

    openContextMenu(event: MouseEvent) {
        event.preventDefault()
        if (!this.hasFileExtension()) {
            return
        }
        this.menuPosition.set(contextMenuPositionAt(event))
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
