import { Component, computed, HostBinding, input, OnDestroy, OnInit, output, signal } from "@angular/core"
import { MetricDistribution } from "../selectors/fileExtensionCalculator"
import { CdkContextMenuTrigger, CdkMenu } from "@angular/cdk/menu"
import { MatCard } from "@angular/material/card"
import { MatMenuItem } from "@angular/material/menu"
import { BlackListExtensionService } from "../blackListExtension.service"
import { NgOptimizedImage } from "@angular/common"
import { HighlightBuildingsByFileExtensionService } from "../highlightBuildingsByFileExtension.service"
import { Subscription } from "rxjs"

@Component({
    selector: "cc-file-extension-bar-segment",
    standalone: true,
    imports: [CdkContextMenuTrigger, MatCard, CdkMenu, MatMenuItem, NgOptimizedImage],
    templateUrl: "./fileExtensionBarSegment.component.html",
    styleUrl: "./fileExtensionBarSegment.component.scss"
})
export class FileExtensionBarSegmentComponent implements OnInit, OnDestroy {
    item = input.required<MetricDistribution>()
    showAbsoluteValues = input.required<boolean>()
    toggleShowAbsoluteValues = output<void>()

    readonly isFlattened = signal<boolean>(false)

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

    flatten(fileExtension: string) {
        this.blackListExtensionService.flatten(fileExtension)
    }

    exclude(fileExtension: string) {
        this.blackListExtensionService.exclude(fileExtension)
    }

    show(fileExtension: string) {
        this.blackListExtensionService.show(fileExtension)
    }

    onHoverFileExtensionBar(hoveredExtension: string) {
        this.highlightBuildingsByFileExtensionService.highlightExtension(hoveredExtension)
    }

    onUnhoverFileExtensionBar() {
        this.highlightBuildingsByFileExtensionService.clearHighlightingOnFileExtensions()
    }

    private formatTitle(showAbsoluteValues: boolean, item: MetricDistribution, fileExtension: string) {
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
