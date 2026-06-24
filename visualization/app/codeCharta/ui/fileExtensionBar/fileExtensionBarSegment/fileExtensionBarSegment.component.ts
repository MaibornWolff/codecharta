import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    HostBinding,
    HostListener,
    input,
    OnDestroy,
    OnInit,
    output,
    signal,
    viewChild
} from "@angular/core"
import { MetricDistribution } from "../selectors/fileExtensionCalculator"
import { BlackListExtensionService } from "../blackListExtension.service"
import { HighlightBuildingsByFileExtensionService } from "../highlightBuildingsByFileExtension.service"
import { Subscription } from "rxjs"

const MENU_WIDTH_PX = 192
const VIEWPORT_MARGIN_PX = 4

@Component({
    selector: "cc-file-extension-bar-segment",
    templateUrl: "./fileExtensionBarSegment.component.html",
    styleUrl: "./fileExtensionBarSegment.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExtensionBarSegmentComponent implements OnInit, OnDestroy {
    item = input.required<MetricDistribution>()
    showAbsoluteValues = input.required<boolean>()
    toggleShowAbsoluteValues = output<void>()

    readonly isFlattened = signal<boolean>(false)
    readonly menuPosition = signal<{ left: number; bottom: number } | null>(null)

    private readonly menuRef = viewChild<ElementRef<HTMLElement>>("menu")

    readonly fileExtension = computed<string>(() => this.item().fileExtension)
    readonly hasFileExtension = computed(() => this.fileExtension() !== "None")
    readonly formattedTitle = computed(() => {
        return this.formatTitle(this.showAbsoluteValues(), this.item(), this.fileExtension())
    })

    private flattenSubscription: Subscription

    constructor(
        private readonly blackListExtensionService: BlackListExtensionService,
        private readonly highlightBuildingsByFileExtensionService: HighlightBuildingsByFileExtensionService
    ) {}

    ngOnInit(): void {
        this.flattenSubscription = this.blackListExtensionService
            .getIsFlattenedByFileExtension(this.fileExtension())
            .subscribe(isFlattened => this.isFlattened.set(isFlattened))
    }

    ngOnDestroy() {
        this.flattenSubscription?.unsubscribe()
    }

    openContextMenu(event: MouseEvent) {
        event.preventDefault()
        if (!this.hasFileExtension()) {
            return
        }
        const left = Math.max(VIEWPORT_MARGIN_PX, Math.min(event.clientX, window.innerWidth - MENU_WIDTH_PX - VIEWPORT_MARGIN_PX))
        const bottom = Math.max(VIEWPORT_MARGIN_PX, window.innerHeight - event.clientY)
        this.menuPosition.set({ left, bottom })
    }

    closeContextMenu() {
        this.menuPosition.set(null)
    }

    @HostListener("document:pointerdown", ["$event"])
    onDocumentPointerDown(event: Event) {
        if (!this.menuPosition()) {
            return
        }
        const menuElement = this.menuRef()?.nativeElement
        if (menuElement && event.target instanceof Node && menuElement.contains(event.target)) {
            return
        }
        this.closeContextMenu()
    }

    @HostListener("document:wheel")
    @HostListener("window:resize")
    closeContextMenuOnViewportChange() {
        if (this.menuPosition()) {
            this.closeContextMenu()
        }
    }

    flatten(fileExtension: string) {
        this.blackListExtensionService.flatten(fileExtension)
        this.closeContextMenu()
    }

    exclude(fileExtension: string) {
        this.blackListExtensionService.exclude(fileExtension)
        this.closeContextMenu()
    }

    show(fileExtension: string) {
        this.blackListExtensionService.show(fileExtension)
        this.closeContextMenu()
    }

    onHoverFileExtensionBar(hoveredExtension: string) {
        this.highlightBuildingsByFileExtensionService.highlightExtension(hoveredExtension)
    }

    onUnhoverFileExtensionBar() {
        this.highlightBuildingsByFileExtensionService.clearHighlightingOnFileExtensions()
    }

    private formatTitle(showAbsoluteValues: boolean, item: MetricDistribution, fileExtension: string) {
        const isDataAvailable = (showAbsoluteValues && item.absoluteMetricValue) || (!showAbsoluteValues && item.relativeMetricValue)
        if (!isDataAvailable) {
            return `No data available`
        }

        if (showAbsoluteValues) {
            return `${fileExtension} ${item.absoluteMetricValue.toLocaleString()}`
        }

        return `${fileExtension} ${item.relativeMetricValue.toFixed(2)}%`
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
