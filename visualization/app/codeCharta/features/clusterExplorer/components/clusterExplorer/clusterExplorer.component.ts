import { ChangeDetectionStrategy, Component, computed, ElementRef, effect, inject, OnDestroy, signal, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { formatClusterShare, showsRealNames } from "../../../../lenses/clusters/clusters.facade"
import { ExplorerScrollHostService, ListViewport, listWindow } from "../../../sidebarExplorer/facade"
import { clusterListEntriesOf } from "../../selectors/clusterListEntries"
import { BY_SHARE, detailLineOf, matchingRowsInOrder, sortOptionsOf } from "../../selectors/clusterRowOrder"
import { ClusterShareRow, ClusterShares, clusterSharesOf, SHARE_OF_FILES } from "../../selectors/clusterShares"
import { ClusterHighlightService } from "../../services/clusterHighlight.service"
import { ClusterExplorerReadStore } from "../../stores/clusterExplorer.read.store"

const ROW_SELECTOR = "[data-cluster-row]"
const MOST_ROWS_WITHOUT_FILTER = 10

@Component({
    selector: "cc-cluster-explorer",
    templateUrl: "./clusterExplorer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block px-2 py-2" }
})
export class ClusterExplorerComponent implements OnDestroy {
    private readonly readStore = inject(ClusterExplorerReadStore)
    private readonly highlight = inject(ClusterHighlightService)
    private readonly scrollHostService = inject(ExplorerScrollHostService)
    private readonly viewport = new ListViewport(ROW_SELECTOR)
    private readonly list = viewChild.required<ElementRef<HTMLElement>>("list")

    private readonly clusterings = toSignal(this.readStore.clusterings$, { requireSync: true })
    private readonly shownFiles = toSignal(this.readStore.shownFiles$, { requireSync: true })
    private readonly areaMetric = toSignal(this.readStore.areaMetric$, { requireSync: true })
    private readonly chosenKey = signal<string | null>(null)
    private readonly chosenSort = signal(BY_SHARE)
    private readonly isOffMapGroupOpen = signal(false)
    readonly filterText = signal("")

    readonly clusteringOptions = computed(() =>
        Object.entries(this.clusterings())
            .map(([key, clustering]) => ({ key, title: clustering.title }))
            .sort((first, second) => first.title.localeCompare(second.title))
    )
    readonly activeKey = computed(() => {
        const options = this.clusteringOptions()
        return options.find(option => option.key === this.chosenKey())?.key ?? options[0]?.key
    })
    private readonly activeClustering = computed(() => this.clusterings()[this.activeKey()])
    readonly shares = computed((): ClusterShares => {
        const clustering = this.activeClustering()
        return clustering
            ? clusterSharesOf(clustering, this.shownFiles(), this.areaMetric())
            : { rows: [], notAttributedShare: null, shareLabel: SHARE_OF_FILES, attributeTitles: {} }
    })
    readonly sortOptions = computed(() => sortOptionsOf(this.shares().shareLabel, this.shares().attributeTitles))
    readonly activeSort = computed(() => this.sortOptions().find(option => option.key === this.chosenSort())?.key ?? BY_SHARE)
    readonly showsFilter = computed(() => this.shares().rows.length > MOST_ROWS_WITHOUT_FILTER || this.filterText() !== "")
    readonly rows = computed(() => matchingRowsInOrder(this.shares().rows, this.filterText(), this.activeSort()))
    readonly entries = computed(() => {
        const offMapIds = this.clusterIdsOffTheMap()
        return clusterListEntriesOf(this.rows(), {
            isOffMap: row => offMapIds.has(row.id),
            isOpen: this.isOffMapGroupOpen(),
            sharesAddUp: this.shares().notAttributedShare !== null
        })
    })
    readonly window = computed(() => listWindow({ ...this.viewport.geometry(), rowCount: this.entries().length }))
    readonly renderedEntries = computed(() => this.entries().slice(this.window().firstIndex, this.window().lastIndex + 1))
    // Whichever clustering is open: the map holds the names either way.
    readonly showsRealNames = computed(() => Object.keys(this.clusterings()).some(showsRealNames))
    readonly pinnedClusterId = this.highlight.pinnedClusterId
    readonly formatShare = formatClusterShare
    readonly clusterIdsOffTheMap = computed(() => {
        const isOnMap = this.highlight.isOnMap()
        return new Set(
            this.shares()
                .rows.filter(row => !row.filePaths.some(path => isOnMap(path)))
                .map(row => row.id)
        )
    })

    // Every row keeps the same height, which the list's windowing relies on, so one row needing this line gives it to all
    readonly reservesDetailLine = computed(() => this.sortOptions().length > 1 || this.shares().rows.some(row => row.mapShare !== null))

    constructor() {
        effect(() => this.viewport.attachTo(this.list().nativeElement, this.scrollHostService.element()))
    }

    summaryOf(row: ClusterShareRow): string {
        return detailLineOf(row, this.shares().attributeTitles, this.activeSort())
    }

    titleOf(row: ClusterShareRow): string {
        const fileCount = row.filePaths.length === 1 ? "1 file" : `${row.filePaths.length} files`
        const placement = this.clusterIdsOffTheMap().has(row.id) ? `${fileCount}, none of them on the map` : fileCount
        return [row.path ?? row.name, placement, this.summaryOf(row)].filter(Boolean).join("\n")
    }

    ngOnDestroy(): void {
        this.highlight.endHover()
        this.viewport.dispose()
    }

    chooseClustering(event: Event): void {
        this.highlight.endHover()
        this.chosenKey.set((event.target as HTMLSelectElement).value)
        this.filterText.set("")
    }

    chooseSort(event: Event): void {
        this.chosenSort.set((event.target as HTMLSelectElement).value)
    }

    filter(event: Event): void {
        this.highlight.endHover()
        this.filterText.set((event.target as HTMLInputElement).value)
    }

    toggleOffMapGroup(): void {
        this.isOffMapGroupOpen.update(isOpen => !isOpen)
    }

    hover(row: ClusterShareRow): void {
        this.highlight.hover(row.filePaths, row.path)
    }

    endHover(): void {
        this.highlight.endHover()
    }

    togglePin(row: ClusterShareRow): void {
        this.highlight.togglePin(row.id, row.filePaths, row.path)
    }
}
