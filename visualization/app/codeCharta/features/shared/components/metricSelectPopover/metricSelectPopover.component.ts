import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, OnDestroy, output, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { AttributeDescriptors } from "../../../../model/codeCharta.model"
import { PopoverPositionArea, SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"
import { FilterMetricDataBySearchTermPipe } from "./filterMetricDataBySearchTerm.pipe"
import { MetricOption } from "./metricOption"
import { MetricSelectOptionComponent } from "./metricSelectOption.component"

@Component({
    selector: "cc-metric-select-popover",
    templateUrl: "./metricSelectPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [FormsModule, FilterMetricDataBySearchTermPipe, SettingsPopoverShellComponent, MetricSelectOptionComponent]
})
export class MetricSelectPopoverComponent implements AfterViewInit, OnDestroy {
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()
    readonly placeholder = input("Search metric")
    readonly positionArea = input<PopoverPositionArea>("top span-right")
    readonly options = input.required<readonly MetricOption[]>()
    readonly descriptors = input<AttributeDescriptors>({})
    readonly selected = input<string | null>(null)
    readonly metricSelected = output<string>()

    readonly shell = viewChild.required(SettingsPopoverShellComponent)
    readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>("searchInput")

    private popover(): ElementRef<HTMLElement> {
        return this.shell().popover()
    }

    readonly searchTerm = signal("")
    readonly activeIndex = signal(0)
    readonly isOpen = signal(false)

    private readonly toggleListener = (event: Event) => {
        const customEvent = event as ToggleEvent
        this.isOpen.set(customEvent.newState === "open")
        if (customEvent.newState === "open") {
            this.searchTerm.set("")
            this.activeIndex.set(this.getSelectedMetricIndex())
            queueMicrotask(() => {
                this.searchInput().nativeElement.focus()
                this.scrollActiveIntoView(this.popover().nativeElement)
            })
        }
    }

    private getSelectedMetricIndex(): number {
        const selected = this.selected()
        if (!selected) {
            return 0
        }
        const index = this.options().findIndex(metric => metric.name === selected)
        return index === -1 ? 0 : index
    }

    ngAfterViewInit(): void {
        this.popover().nativeElement.addEventListener("toggle", this.toggleListener)
    }

    ngOnDestroy(): void {
        this.popover().nativeElement.removeEventListener("toggle", this.toggleListener)
    }

    handleSearchTermChange(value: string) {
        this.searchTerm.set(value)
        this.activeIndex.set(0)
    }

    handleKeyDown(event: KeyboardEvent) {
        const popoverElement = this.popover().nativeElement
        const list = this.getFilteredItems(popoverElement)
        if (list.length === 0) {
            return
        }
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault()
                this.activeIndex.set(Math.min(list.length - 1, this.activeIndex() + 1))
                this.scrollActiveIntoView(popoverElement)
                break
            case "ArrowUp":
                event.preventDefault()
                this.activeIndex.set(Math.max(0, this.activeIndex() - 1))
                this.scrollActiveIntoView(popoverElement)
                break
            case "Enter": {
                event.preventDefault()
                const activeName = list[this.activeIndex()]?.dataset.metricName
                if (activeName) {
                    this.handleSelect(activeName)
                }
                break
            }
            case "Escape":
                this.closePopover()
                break
        }
    }

    handleSelect(name: string) {
        this.metricSelected.emit(name)
        this.closePopover()
    }

    private closePopover() {
        const popover = this.popover().nativeElement
        if (popover.matches(":popover-open")) {
            popover.hidePopover()
        }
    }

    private getFilteredItems(popoverElement: HTMLElement): HTMLElement[] {
        return Array.from(popoverElement.querySelectorAll<HTMLElement>("[data-metric-name]"))
    }

    private scrollActiveIntoView(popoverElement: HTMLElement) {
        const items = this.getFilteredItems(popoverElement)
        const active = items[this.activeIndex()]
        active?.scrollIntoView?.({ block: "nearest" })
    }
}
