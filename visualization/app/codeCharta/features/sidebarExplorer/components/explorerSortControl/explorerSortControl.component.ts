import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { SortingOption } from "../../../../model/codeCharta.model"
import { ExplorerSortService } from "../../services/explorerSort.service"
import { SidebarExplorerWriteStore } from "../../stores/sidebarExplorer.write.store"

@Component({
    selector: "cc-explorer-sort-control",
    templateUrl: "./explorerSortControl.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerSortControlComponent {
    private readonly explorerSortService = inject(ExplorerSortService)
    private readonly writeStore = inject(SidebarExplorerWriteStore)
    private readonly elementRef = inject(ElementRef<HTMLElement>)

    readonly isOpen = signal(false)
    readonly sortOptions = Object.values(SortingOption) as SortingOption[]

    readonly sortState = toSignal(this.explorerSortService.sortState$, { requireSync: true })
    readonly currentOption = computed(() => this.sortState()[0])
    readonly isAscending = computed(() => this.sortState()[1])

    @HostListener("document:click", ["$event"])
    handleDocumentClick(event: MouseEvent) {
        if (!this.isOpen()) {
            return
        }
        if (event.target instanceof Node && !this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false)
        }
    }

    toggleOpen() {
        this.isOpen.update(value => !value)
    }

    setSortingOption(value: SortingOption) {
        this.writeStore.setSortingOption(value)
        this.isOpen.set(false)
    }

    toggleSortOrder() {
        this.writeStore.toggleSortingOrderAscending()
        this.isOpen.set(false)
    }
}
